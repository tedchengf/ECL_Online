/* initialize jsPsych */
var jsPsych = initJsPsych({
	on_finish: function() {
		jsPsych.data.get().localSave('csv', 'experiment-data.csv');
	}
});

/* create timeline */
var timeline = [];
var count = 0;


var seq_truth = {
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
	361: false
};

// Define the sequence of object pairs to show
var object_pairs = [
    [2, 3],  // red circle wave, blue circle wave
    [5, 7],  // red triangle wave, blue triangle wave
    [11, 13], // red circle dot, blue circle dot
    [17, 19], // red triangle dot, blue triangle dot
    // [2, 5],  // red circle wave, red triangle wave
    // [3, 7],  // blue circle wave, blue triangle wave
    // [11, 17], // red circle dot, red triangle dot
    // [13, 19], // blue circle dot, blue triangle dot
    // [2, 11], // red circle wave, red circle dot
    // [3, 13], // blue circle wave, blue circle dot
    // [5, 17], // red triangle wave, red triangle dot
    // [7, 19]  // blue triangle wave, blue triangle dot
];

var objects_src = {
	2: 'src/rcw.png',
	3: 'src/bcw.png',
	5: 'src/rtw.png',
	7: 'src/btw.png',
	11: 'src/rcd.png',
	13: 'src/bcd.png',	
	17: 'src/rtd.png',
	19: 'src/btd.png',
}

var preload = {
	type: jsPsychPreload,
	images: Object.values(objects_src),
	audio: [
		'src/Correct.wav',
		'src/Incorrect.wav',
	],
}
timeline.push(preload);


var welcome_1 = {
	type: jsPsychHtmlButtonResponse,
	stimulus: `
		<center>
		<h2>Background</h2>
		<p class="explanations">You are a newly employed physicist in the Deep Rock Corporate, and are assigned to the F-302 lab to investigate a group of exotic objects. The objects resemble simple geometric shapes and are otherwise unimpressive. However, an earlier report indicates that these objects contain a tremendous amount of energy, but will only release the energy (through an explosion) when they are arranged in a certain combination with other objects. .</p>
		<br>
		<p class="explanations">You are a newly hired physicist, and your first task is to investigate these objects and find out when will they explode.</p>
		</center>
	`,
	choices: ["Continue"]
};

var welcome_2 = {
	type: jsPsychHtmlButtonResponse,
	stimulus: `
		<center>
		<table>
			<tr>
				<td> <img class="stimuli" src="${objects_src[2]}"> </td>
				<td> <img class="stimuli" src="${objects_src[3]}"> </td>
				<td> <img class="stimuli" src="${objects_src[5]}"> </td>
				<td> <img class="stimuli" src="${objects_src[7]}"> </td>
			</tr>
			<tr>
				<td> <img class="stimuli" src="${objects_src[11]}"> </td>
				<td> <img class="stimuli" src="${objects_src[13]}"> </td>
				<td> <img class="stimuli" src="${objects_src[17]}"> </td>
				<td> <img class="stimuli" src="${objects_src[19]}"> </td>
			</tr>
		</table>
		<br>
		<p class="explanations">Above are the 8 subjects currently being investigated. These objects differ in their colors (red/blue), shapes (circle/triangle), and textures (dots/waves). </p>
		</center>
	`,
	choices: ["Continue"]
};

var welcome_3 = {
	type: jsPsychHtmlButtonResponse,
	stimulus: `
		<center>
		<table>
			<tr>
				<td> <img class="stimuli" src="${objects_src[2]}"> </td>
				<td> <img class="stimuli" src="${objects_src[7]}"> </td>
			</tr>
		</table>
		<br>
		<p class="explanations">When two objects are put together (shown above), they sometimes explode. However, the exact rule behind triggering the explosion is unknown. Currently, we know that the order of the objects (left/right) does not matter, and explosions are triggered only some combination of features among the two objects. It is your task to figure out this rule. </p>
		</center>
	`,
	choices: ["Continue"]
};

var welcome_4 = {
	type: jsPsychHtmlButtonResponse,
	stimulus: `
		<center>
		<p class="explanations">This is a self-paced experiment. In each trial, you can select two objects for testing. You need to submit your prediction of the outcome (explode/not explode) before getting to see the actual outcome.</p>
		<br>
		<p class="explanations">At the start you will just have to guess, but over time you should detect some patterns. When you are confident that you get the rule, you can end the experiment and demonstrate your knowledge through a test block.</p>
		</center>
	`,
	choices: ["I'm Ready"]
};

// timeline.push(welcome_1, welcome_2, welcome_3, welcome_4)

// Create an array of trial objects, one for each object pair
var trials = object_pairs.map(([obj1_code, obj2_code], index) => ({
    type: jsPsychSurveyMultiSelect,
    preamble: function() {
        return `<h2>Trial ${index + 1}</h2>`;
    },
    questions: [
        {
            prompt: `
                <center>
				<div id="jspsych-survey-multi-select-form" class="jspsych-survey-multi-select-form" style="margin-left: 0;">
                        <img class="stimuli" src="${objects_src[obj1_code]}">
                        <img class="stimuli" src="${objects_src[obj2_code]}">
                    </div>
                    <p class="stimuli">Will these two objects explode?</p>
                </center>
            `,
            options: [
                { html: '<div class="prediction-option" style="display: inline-block; margin: 0 20px; text-align: center;">True (Yes, they will explode)</div>', value: 'true' },
                { html: '<div class="prediction-option" style="display: inline-block; margin: 0 20px; text-align: center;">False (No, they won\'t explode)</div>', value: 'false' }
            ],
            horizontal: true,
            required: true,
            required_selections: 1,
            name: 'prediction',
        }
    ],
    button_label: "Submit Prediction",
    on_finish: function(data) {
        data.response.Obj1 = obj1_code;
        data.response.Obj2 = obj2_code;
    }
}));

var output_trial = {
	type: jsPsychHtmlButtonResponse,
	stimulus: function(){
		const lastData = jsPsych.data.getLastTrialData().values()[0];
		const Obj1 = lastData.response.Obj1;
		const Obj2 = lastData.response.Obj2;
		var seq_id = Obj1 * Obj2;
		var current_truth = seq_truth[seq_id];

		// Get all previous trials
		const past_trials = jsPsych.data.get().filter({trial_type: 'survey-multi-select'}).values();
		let history_html = '';
		if (past_trials.length > 0) {
			let history_rows = [];
			for (let i = past_trials.length - 1; i > -1; i--) {
				const trial_data = past_trials[i];
				const past_Obj1 = trial_data.response.Obj1;
				const past_Obj2 = trial_data.response.Obj2
				const past_seq_id = past_Obj1 * past_Obj2;
				const past_truth = seq_truth[past_seq_id];
				
				history_rows.push(`
					<div class="trial-container" style="background-color: ${past_truth ? 'rgba(231, 76, 60, 0.1)' : 'rgba(39, 174, 96, 0.1)'}">
						<div class="trial-outcome">
							<div style="display: flex; justify-content: space-between;">
								Trial ${i+1} 
								<span style="color: ${past_truth ? '#e74c3c' : '#27ae60'}; font-weight: 500;">
									${past_truth ? 'explode' : 'not explode'}
								</span>
							</div>
						</div>
						<div style="height: 10px;"></div>
						<div class="trial-outcome">
							<img class="past_stimuli" src="${objects_src[past_Obj1]}">
							<img class="past_stimuli" src="${objects_src[past_Obj2]}">
						</div>
					</div>
				`);
			}
			
			history_html = `
				<div id="jspsych-survey-multi-select-sliders" class="jspsych-survey-multi-select-sliders" style="transform: translateX(-100%);">
					<div style="display: flex; justify-content: space-between; align-items: center;">
						<h3>Previous Trials:</h3>
					</div>
					${history_rows.join('')}
				</div>
			`;
		}

		return `
			${history_html}
			<div id="jspsych-survey-multi-select-form" class="jspsych-survey-multi-select-form" style="margin-left: 0;">
				<button id="toggle-history" class="history-toggle-btn">Show History</button>
				<center>
					<div class="trial-images">
						<img class="stimuli" src="${objects_src[Obj1]}">
						<img class="stimuli" src="${objects_src[Obj2]}">
					</div>
					<br>
					Prediction: ${lastData.response.prediction ? 'explode' : 'not explode'} <br>
					Truth: ${current_truth ? 'explode' : 'not explode'}
				</center>
			</div>
		`;
	},
	choices: ["Continue"],
	on_load: function() {
		const toggleButton = document.getElementById('toggle-history');
		const sidebar = document.getElementById('jspsych-survey-multi-select-sliders');
		const form = document.getElementById('jspsych-survey-multi-select-form');
		const continueButton = document.querySelector('.jspsych-btn');
		
		if (toggleButton && sidebar && form) {
			toggleButton.addEventListener('click', function() {
				const isHidden = sidebar.style.transform === 'translateX(-100%)';
				sidebar.style.transform = isHidden ? 'translateX(0)' : 'translateX(-100%)';
				form.style.marginLeft = isHidden ? 'var(--sidebar-width)' : '0';
				toggleButton.textContent = isHidden ? 'Hide History' : 'Show History';
				
				// Adjust continue button margin
				if (continueButton) {
					continueButton.style.marginLeft = isHidden ? 'var(--sidebar-width)' : '0';
				}

				// Log history access
				if (isHidden) {  // Only log when showing history
					// Log current trial access
					jsPsych.data.addDataToLastTrial({
						history_accessed_this_trial: true
					});

					// Log first-ever access
					if (!history_ever_accessed) {
						history_ever_accessed = true;
						jsPsych.data.addDataToLastTrial({
							history_first_access: true,
							history_first_access_time: new Date().toISOString(),
							history_first_access_trial: count
						});
					}
				}
			});
		}
	}
};

// Add each trial and its output trial to the timeline
object_pairs.forEach((pair, index) => {
    timeline.push(trials[index]);
    timeline.push(output_trial);
});

// Add CSV export trial
var export_trial = {
    type: jsPsychHtmlButtonResponse,
    stimulus: function() {
        // Save the data
        jsPsych.data.get().localSave('csv', 'experiment-data.csv');
        
        return `
            <div style="text-align: center;">
                <h2>Experiment Complete</h2>
                <p>Thank you for participating!</p>
                <p>Your data has been saved.</p>
            </div>
        `;
    },
    choices: ["Close"],
    button_html: '<button class="jspsych-btn" style="background-color: #2980b9; color: white; padding: 15px 30px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; margin-top: 20px;">Close</button>'
};

timeline.push(export_trial);

jsPsych.run(timeline);