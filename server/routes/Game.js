const { Router } = require('express');
const { Users, Games } = require('../database/Models');
const { common, all } = require('../words');

const GameRouter = Router();

Array.prototype.shuffle = function() {
    let currentIndex = this.length, randomIndex;
  
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
  
      [this[currentIndex], this[randomIndex]] = [
        this[randomIndex], this[currentIndex]];
    }  
};

GameRouter.route('/resume')
    .post(async (request, response) => {
        const { id } = request.body;
        if (typeof id !== 'string') return response.send('no botting.');

        const user = await Users.findOne({ id, });
        if (!user) return response.status(400).send('Invalid ID.');

        const recent = user.games[user.games.length - 1];
        const game = await Games.findOne({ id: recent, });

        if (!game?.active) return response.json({ status: 'SUCCESS', data: { guesses: [], results: [], } });
        
        response.json({
            status: 'SUCCESS',
            data: {
                guesses: game?.guesses[user.name] || [],
                results: game?.results[user.name] || [],
            },
        });
    });

GameRouter.route('/start')
    .post(async (request, response) => {        
        const { id, type } = request.body;
        if (typeof id !== 'string' || typeof type !== 'string') return response.send('no botting.');

        const user = await Users.findOne({ id, });
        if (!user) return response.status(400).send('Invalid ID.');
        
        common.shuffle();
        console.log(common[0]);
        
        const gameID = require('crypto').randomBytes(8).toString('hex');

        const game = new Games({
            id: gameID,
            type,
            players: [user.name],
            word: common[0],
            guesses: {
                placeholder: true,
            },
            results: {},
            active: true,
            usedHint: {},
        });

        user.games.push(gameID);

        game.save()
            .then(() => {
                user.save()
                    .then(() => {
                        response.json({ status: 'SUCCESS', });
                    })
                    .catch(error => {
                        console.error(error);

                        response.status(500).json({
                            status: 'ERROR',
                            data: { message: 'An internal error occured when starting a game. Please retry later.', dev_error: error, },
                        });
                    });
            })
            .catch(error => {
                console.error(error);

                response.status(500).json({
                    status: 'ERROR',
                    data: { message: 'An internal error occured when starting a game. Please retry later.', dev_error: error, },
                });
            });
    }); 

GameRouter.route('/guess')
    .post(async (request, response) => {
        const { id, guess } = request.body;
        if (typeof id !== 'string' || typeof guess !== 'string') return response.send('no botting.');
        if (!all.includes(guess) && !common.includes(guess)) return response.status(400).json({ status: 'ERROR', data: { message: 'Invalid word.' } });

        const user = await Users.findOne({ id, });
        if (!user) return response.status(400).send('Invalid ID.');

        const recent = user.games[user.games.length - 1];
        const game = await Games.findOne({ id: recent, });

        if (!game) return response.status(500).send({ status: 'ERROR', data: { message: 'An internal error occured when trying to attempt a guess for this game.', } });

        if (!game.guesses[user.name]) game.guesses[user.name] = [];
        if (!game.results[user.name]) game.results[user.name] = [];
        if (!game.usedHint[user.name]) game.usedHint[user.name] = false;

        const data = { result: null, finished: false, };

        if (game.type === 'multiplayer') {
            if (game.players.length !== 2) return response.status(403).json({ status: 'ERROR', data: { message: 'No one has accepted your challenge yet.' } });
        } else {
            game.guesses[user.name].push(guess);

            let result = '';
            let lettersDone = {};
        
            function ensurePartiality(letter) { // NOTE: This may be bugged, and is not fully tested yet.
                const split = { guess: guess.split(''), word: game.word.split(''), result: result.split('') };
        
                let partial = true;
                if (split.word.filter(l => l == letter).length < split.guess.filter(l => l == letter).length) {
                    let difference = split.guess.filter(l => l == letter).length - split.word.filter(l => l == letter).length;
        
                    if (!lettersDone[letter]) return lettersDone[letter] = 0;
                    lettersDone[letter]++;
                    if (lettersDone[letter] > difference) partial = false;
                }
        
                return partial;
            }
        
            guess.split('').forEach((letter, index) => {
                let split = game.word.split('');
        
                if (split[index] == letter) return result += 'c';
                if (split.includes(letter) && ensurePartiality(letter)) return result += 'p';
                result += 'n';
            });
            game.results[user.name].push(result);    

            data.result = result;

            if (result === 'ccccc') {
                active = false;

                data.finished = true;
                data.word = game.word;
                data.failed = false;

                user.stats.singleplayer.correct++;
            } else if (game.guesses.length === 6) {
                active = false;

                data.finished = true;
                data.word = game.word;
                data.failed = true;

                user.stats.singleplayer.incorrect++;
            }
        }

        game.save()
            .then(() => {
                user.save()
                    .then(() => {
                        response.json({ status: 'SUCCESS', data, });
                    })
                    .catch(error => {
                        console.error(error);

                        response.status(500).json({
                            status: 'ERROR',
                            data: { message: 'An internal error occured when starting a game. Please retry later.', dev_error: error, },
                        });
                    });
            })
            .catch(error => {
                console.error(error);

                response.status(500).json({
                    status: 'ERROR',
                    data: { message: 'An internal error occured when starting a game. Please retry later.', dev_error: error, },
                });
            });
    });

module.exports = { GameRouter };