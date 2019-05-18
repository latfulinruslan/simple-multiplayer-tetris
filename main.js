function createPiece(type) {
	if (type === 'T') {
		return [
		    [0, 0, 0],
		    [1, 1, 1],
		    [0, 1, 0],
		];
	} else if (type === 'O') {
		return [
		    [2, 2],
		    [2, 2],
		];
	} else if (type === 'L') {
		return [
		    [0, 3, 0],
		    [0, 3, 0],
		    [0, 3, 3],
		];
	} else if (type === 'J') {
		return [
		    [0, 4, 0],
		    [0, 4, 0],
		    [4, 4, 0],
		];
	} else if (type === 'I') {
		return [
		    [0, 6, 0, 0],
		    [0, 6, 0, 0],
		    [0, 6, 0, 0],
		    [0, 6, 0, 0],
		];
	} else if (type === 'S') {
		return [
		    [0, 6, 6],
		    [6, 6, 0],
		    [0, 0, 0],
		];
	} else if (type === 'Z') {
		return [
		    [7, 7, 0],
		    [0, 7, 7],
		    [0, 0, 0],
		];
	}
} 

function updateScore() {
	document.getElementById('score').innerText = tetris.player.score;
}

const canvas = document.getElementById('tetris');
const tetris = new Tetris(canvas);

document.addEventListener('keydown', event =>{
	const player = tetris.player;
    if (event.keyCode === 37) {
    	player.move(-1);
    } else if (event.keyCode === 39) {
		player.move(+1);
    } else if (event.keyCode === 40) {
       	player.drop();
    } else if (event.keyCode === 81) {
        player.rotate(-1);
    } else if (event.keyCode === 87) {
    	player.rotate(1);
    }
});

updateScore();