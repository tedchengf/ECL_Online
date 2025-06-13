//=============================================================================
//                                 DATA STRUCTURES
//=============================================================================

const seq_truth = {
	4: true,	
	6: true,
	10: true,
	14: true,
	22: true,
	26: true,
	34: false,
	38: false,
	9: true,
	15: true,
	21: true,
	33: true,
	39: true,
	51: false,
	57: false,
	25: false,
	35: false,
	55: true,
	65: true,
	85: false,
	95: false,
	49: false,
	77: true,
	91: true,
	119: false,
	133: false,
	121: false,
	143: false,
	187: false,
	209: false,
	169: false,
	221: false,
	247: false,
	289: false,
	323: false,
	361: false,
};

const objects_src = {
    2: 'src/rcw.png',
    3: 'src/rcd.png',
    5: 'src/rtw.png',
    7: 'src/rtd.png',
    11: 'src/bcw.png',
    13: 'src/bcd.png',    
    17: 'src/btw.png',
    19: 'src/btd.png',
}; 

// Generate all possible pairs (including self-pairs)
let object_pairs = [];
const object_codes = Object.keys(objects_src).map(Number);  // Convert string keys to numbers

// Generate all pairs
for (let i = 0; i < object_codes.length; i++) {
    for (let j = i; j < object_codes.length; j++) {
        object_pairs.push([object_codes[i], object_codes[j]]);
    }
}

// Take only the first 6 pairs for testing
object_pairs = object_pairs.slice(0, 6);

//=============================================================================
//                                 MESSAGES
//=============================================================================

const messages = {
    welcome: {
        background: {
            title: `Background`,
            text: `You are a newly employed physicist in the Deep Rock Corporate, and are assigned to the F-302 lab to investigate a group of exotic objects. The objects resemble simple geometric shapes and are otherwise unimpressive. However, an earlier report indicates that these objects contain a tremendous amount of energy, but will only release the energy (through an explosion) when they are arranged in a certain combination with other objects. Previous research in the lab had built up an experimental setup that uses disposable robots to arrange the objects, so one can comfortably observe the explosions in your control room.<br><br>There are currently <strong>8</strong> such objects known to the team. Your job is to go through all of these combinations and deduce the correct (and minimal) combination that will always release energy through an explosion.`
        },
        objects: {
            text: `Above are the 8 objects currently being investigated. These objects vary in their <strong>colors (red/blue)</strong>, <strong>shapes (circle/triangle)</strong>, and <strong>textures (dots/waves)</strong>.`
        },
        pairs: {
            text: `A 2-object combination is simply two objects placed near each other. Above is one such combination; <strong>their order does not matter at all.</strong> <br><br> In this experiment, you will go through a number of those combinations. <strong>As each combination is presented, you will be asked to predict whether it will explode, before witnessing the actual result and getting feedback.</strong> <br><br> <strong>We know that a determinstic rule governs the tiggering conditions for explosions, but it is your job to figure out what that rule is.</strong> At first you will just have to guess, but on the basis of the feedback you receive, you should gradually grasp this rule.`
        },
        instructions: {
            text: `This experiments is divided into a <strong>training block</strong> and a <strong>testing block</strong>. In the training block, you are given feedback of your predictions and can acess the history of all past observations. Good use of these information will help you figure out the rule that governs the explosions. <strong>However, please refrain from taking notes of individual trials; our task is rule inference, not memorization.</strong><br><br>In the testing block, you will be tested on the same pairs of objects as in the training block, but you will not see the outcomes of your predictions nor the history. Please make your predictions based on the rule you inferred in the training block. <br><br>To make sure that you understand the task correctly, you will be asked a few comprehension questions in the next page. You will need to answer all questions correctly to proceed.`
        }
    },
    practice: {
        complete: {
            title: `Training Block`,
            text: `You have completed the practice trials, let's proceed to the <strong>training block</strong>.<br><br>You should try your best to infer the rule behind all explosions. Good luck!`
        }
    },
    test: {
        instruction: {
            title: `Test Block`,
            text: `You have completed the training block. Now you will be tested on the same pairs of objects, this time without feedback or the access to past observations. <br><br>Please make your predictions as accurately as possible based on the rule you inferred in the training block.`
        }
    },
    completion: {
        title: `Experiment Complete`,
        text: `Thank you for participating!<br><br>Your data has been saved.`
    },
    buttons: {
        continue: `Continue`,
        beginPractice: `Begin Practice`,
        beginExperiment: `Begin Experiment`,
        beginTest: `Begin Test`,
        close: `Close`,
        submitPrediction: `Submit Prediction`,
        showHistory: `Show History`,
        hideHistory: `Hide History`
    },
    feedback: {
        correct: `Congrats, your prediction was Correct!`,
        incorrect: `Sorry, your prediction was incorrect!`,
        prediction: `Your prediction:`,
        outcome: `Actual outcome:`,
        explode: `Explode`,
        notExplode: `Not Explode`
    }
};

