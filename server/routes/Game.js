const { Router } = require('express');
const { Users } = require('../database/Models');
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
        const users = await Users.find();
        const { id } = request.body;
    
        if (typeof id != 'string') return response.send('no botting.');
        
        const user = users.find(user => user.id === id);
        if (!user) return response.status(401).json({ status: 'ERROR', data: { message: 'Invalid ID.' } });
    
        const currentSession = user.words[user.words.length - 1];
        if (!currentSession || currentSession.completed) return response.json({ status: 'SUCCESS', data: { guesses: [], results: [] } });
        
        let guesses = currentSession.guesses || [];
        let results = currentSession.results || [];
    
        response.json({
            status: 'SUCCESS',
            data: {
                guesses,
                results,
            },
        });
    });

GameRouter.route('/start')
    .post(async (request, response) => {
        const users = await Users.find();
        const { id } = request.body;
    
        if (typeof id != 'string') return response.send('no botting.');
        
        const user = users.find(user => user.id === id);
        if (!user) return response.status(401).json({ status: 'ERROR', data: { message: 'Invalid ID.' } });
    
        common.shuffle();
        console.log(common[0]);
        user.words.push({ word: common[0], guesses: [], results: [], completed: false });
    
        user.save()
            .then(() => {
                response.json({
                    status: 'SUCCESS',
                });
            })
            .catch(error => {
                response.status(500).json({
                    status: 'ERROR',
                    data: { message: 'An internal error occured when starting a game. Please retry later.', dev_error: error, },
                });
            });
    });

GameRouter.route('/guess')
    .post(async (request, response) => {
        const users = await Users.find();
        const { id, guess } = request.body;
    
        if (typeof id != 'string') return response.send('no botting.');
        
        const user = users.find(user => user.id === id);
        if (!user) return response.status(401).json({ status: 'ERROR', data: { message: 'Invalid ID.' } });
    
        if (!user.words[user.words.length - 1]) return response.status(400).json({ status: 'ERROR', data: { message: 'The current game has already been completed. Start a new game by reloading to continue playing.' } });
        if (!common.includes(guess) && !all.includes(guess)) return response.status(400).json({ status: 'ERROR', data: { message: 'Invalid word.' } });
    
        let { word, guesses, results, completed } = user.words[user.words.length - 1];
        if (completed) return response.status(400).json({ status: 'ERROR', data: { message: 'The current game has already been completed. Start a new game by reloading to continue playing.' } });
    
        guesses.push(guess);
    
        let result = '';
        let lettersDone = {};
    
        function ensurePartiality(letter) { // NOTE: This may be bugged, and is not fully tested yet.
            const split = { guess: guess.split(''), word: word.split(''), result: result.split('') };
    
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
            let split = word.split('');
    
            if (split[index] == letter) return result += 'c';
            if (split.includes(letter) && ensurePartiality(letter)) return result += 'p';
            result += 'n';
        });
    
        results.push(result);    
    
        const data = { result, finished: false, };
        if (result == 'ccccc') {
            completed = true; 
    
            data.finished = true;
            data.word = word;
            data.failed = false;
    
            user.correct++;
        } else if (guesses.length == 6) {
            completed = true;
    
            data.finished = true;
            data.word = word;
            data.failed = true;
    
            user.incorrect++;
        }
    
        user.words[user.words.length - 1] = { word, guesses, results, completed };

        user.save()
            .then(() => {
                response.json({ status: 'SUCCESS', data, });
            })
            .catch(error => {
                response.status(500).json({
                    status: 'ERROR',
                    data: { message: 'An internal error occured when starting a game. Please retry later.', dev_error: error, },
                });
            });
    });

module.exports = { GameRouter };