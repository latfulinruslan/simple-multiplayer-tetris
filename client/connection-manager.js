class ConnectionManager {

    constructor(tetrisManager) {
        this.conn = null;
        this.peers = new Map;

        this.tetrisManager = terisManager;
        this.localTetris = [...tetrisManager.instances][0]; 
    }

    connect(address) {
        this.conn = new WebSocket(address);

        this.conn.addEventListener('open', () => {
            console.log('Connection established');
            this.initSession();
            this.watchEvents();
        });

        this.conn.addEventListener('message', event => {
            console.log('Recevied message', event.data);
            this.receive(event.data);
        });
    }

    initSession() {
        const sessionId = window.location.hash.split('#')[1];
        const state = this.localTetris.serialize();

        if (sessionId) {
            this.send({
                type: 'join-session',
                id: sessionId,
                state
            });
        } else {
            this.send({
                type: 'create-session',
                state,
            });
        }
    }

    watchEvents() {
        const local = this.localTetris;

        const player = local.player;
        ['pos', 'matrix', 'score'].forEach(property => {
            player.events.listen(property, value => {
                this.send({
                    type: 'state-update',
                    fragment: 'player',
                    state: [property, value],
                });
            });
        });
        
        const arena = local.arena;
        ['matrix'].forEach(property => {
            arena.events.listen(property, value => {
                this.send({
                    type: 'state-update',
                    fragment: 'arena',
                    state: [property, value],
                });
            });
        });
    }

    updateManager(peers) {
        const me = peers.you;
        const clients = peers.clients.filter(client => me !== client.id);
        clients.forEach(client => {
            if (!this.peers.has(client.id)) {
                const tetris = this.tetrisManager.createPlayer();
                tetris.deserialize(client.state);
                this.peers.set(client.id, tetris); 
            }
        });

        [...this.peers.entries()].forEach(([id, tetris]) => {
            if (!clients.some(client => client.id === id)) {
                this.tetrisManager.removePlayer(tetris);
                this.peers.delete(id);
            }
        });

        const sorted = peers.clients.map(client => {
            return this.peers.get(client.id) || this.localTetris;
        });
        this.tetrisManager.sortPlayers(sorted);
    }

    updatePeer(id, fragment, [property, value]) {
        if (!this.peers.has(id)) {
            console.error('Client does not exists', id);
            return;
        }

        const tetris = this.peers.get(id);
        tetris[fragment][property] = value;

        if (property === 'score') {
            tetris.updateScore(value);
        } else {
            tetris.draw();
        }
    }

    receive(msg) {
        const data = JSON.parse(msg);
        if (data.type === 'session-created') {
            window.location.hash = data.id;
        } else if (data.type === 'session-broadcast') {
            this.updateManager(data.peers);
        } else if (data.type === 'state-update') {
            this.updatePeer(data.clientId, data.fragment, data.state);
        }
    }

    send(data) {
        const msg = JSON.stringify(data);
        console.log(`Sending message ${msg}`);
        this.conn.send(msg);
    }
}