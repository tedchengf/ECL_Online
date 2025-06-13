import { polarities, cbns } from './cbn.js'

const production_debug_options = {
  consent: true,
  load_delay: 500,
  require_movement: true,
  skip_meat: false
}
var debug_options = {
  consent: false,
  load_delay: 100,
  require_movement: false,
  skip_meat: true 
}
debug_options = production_debug_options


const app_url = "https://continuous-e1-14b1bd49b44d.herokuapp.com"
const prolific_url = "https://app.prolific.com/submissions/complete?cc=C1EN0AUV"
const prolific_completion_code = "C1EN0AUV"

const canvas_size = [450, 720]
 
// Must be saved in Powerpoint as png 720 x 450
const var_image_file = "./graphics/nets/Slide1.png"

const domains_vars = {
  absorption: ["water absorption","protein absorption","fructose absorption"],
  neuro:      ["serotonin","epinephrine","dopamine"],
  blood:      ["red blood cells","white blood cells","platelet concentration"]
}
  
const factors = {
  polarity: ['gen_gen','gen_inh','inh_gen','inh_inh'],
  //polarity: ['gen_gen','inh_gen'], 
  domain:   ['absorption','neuro','blood']
  //domain:   ['neuro','blood']
}

const continue_prompt = "<i>Press any key to continue</i>";

const adjective_hi = {gen: "high", inh: "low"}
const adjective_lo = {gen: "low", inh: "high"}
const pos_neg = {gen: "positive", inh: "negative"}

// Given an observation, construct a string describing it
function value_str(text, vals) { 
  var frag = []
  var fi = 0
  for (let vi = 0; vi < vals.length; vi++) {
    if (typeof vals[vi] != 'undefined') {
      frag[fi] = text.vars[vi].name + ' level is ' + vals[vi]
      fi++
    }
  }
  var s = "This person's " + frag[0]
  if (frag.length == 2) {
    s = s + " and their " + frag[1]
  }
  else if (frag.length == 3) {
    s = s + ", their " + frag[1] + ', and their ' + frag[2]
  }
  s = s + "."
  return (s)
}

function add_timeline_fullscreen(timeline, pinfo) {
  var text = 
    "<h1>Welcome to the experiment!</h1>" +
    "<h2>You will enter full screen mode when you press the button below</h2>"
  if (pinfo.prolific) {
    text = text + 
      "<h2>Prolific users note: You will be provided with an reimbursement url" +
      " and completion code at the end of the experiment.</h2>"
  }  

  var fullscreen_task = {
    type: jsPsychFullscreen,
    message: text,
    button_label: "Yes, I want to continue",
    fullscreen_mode: true
  }
  timeline.push(fullscreen_task)
}

function add_timeline_consent(timeline) {
  var check = function(elem) {
    if (document.getElementById('consent_checkbox').checked) {
        return true;
    }
    else {
        alert(
          "If you wish to participate, you must check the box next to the statement " + 
           " 'I agree to participate in this study.'"
        );
        return false;
    }
    return false;
  };

  var consent_trial = {
    type: jsPsychExternalHtml, url: "consent.html", cont_btn: "start", check_fn: check
  }
  timeline.push(consent_trial)
}

function add_preload_task (timeline, image_files) {
  timeline.push({
    type: jsPsychPreload, images: image_files, show_detailed_errors: true
  })
}

function add_timeline_intro (timeline, domain) {
   var intro_text = 
    "<h1>Overview</h1>" +
    "<p>In this experiment you are being asked to pretend you are a physiologist studying biological processes in the human body.</p>" +
    "<p>You perform studies in which you bring healthy people into a laboratory and measure three physiological variables. " +
    "The first variable is <b>" + domain.vars[0].name + "</b>" + 
    ", the second variable is <b>" + domain.vars[1].name + "</b>" + 
    ", and the third is <b>" + domain.vars[2].name + ".</b></p>" +
    "<p>For any individual, each of these variables can be measured on a scale of 0-100. " +
    "For example, the next page presents a diagram showing the measurements for one person.</p>";

  var intro = { 
    type: jsPsychHtmlKeyboardResponse,
    stimulus: intro_text,
    prompt: continue_prompt
  }
  timeline.push(intro)
}

function draw_continuous_stim(c, domain, vals, image_file_name=undefined) {
 
  function drawVarVal (var_text, val, width, height) {
    ctx.font = "20px " + font;
    var_text = var_text.split(" ")
    for (let i = 0; i < var_text.length; i++) {
      ctx.fillText (var_text[i], width, height + line_height * i);
    };
    ctx.font = "28px " + font;
    if (typeof val == 'undefined') {
      val = '?'
    }
    ctx.fillText(val, width, height + line_height * (var_text.length + 1));
  }
  
  var ctx = c.getContext('2d');
  const img = new Image(); 
  if (typeof image_file_name == 'undefined') {
    image_file_name = var_image_file
  }
  img.src = image_file_name; 
  ctx.drawImage(img,0,0)
  let line_height = 25;
  let font = "Arial"
  ctx.textAlign = "center";
  drawVarVal (domain.vars[0].name, vals[0], c.width*.25, c.height*.65);
  drawVarVal (domain.vars[1].name, vals[1], c.width*.50, c.height*.15);
  drawVarVal (domain.vars[2].name, vals[2], c.width*.75, c.height*.65);
}

function observation1_task (domain, vals, prompt, image_file_name=undefined) {
  var stim = {
      type: jsPsychCanvasKeyboardResponse,
      canvas_size: canvas_size,
      stimulus: function (c) {
        draw_continuous_stim(c, domain, vals, image_file_name)
      },
      prompt: prompt + continue_prompt
  }
  return (stim)
}

function add_timeline_observation1 (timeline, domain, vals, prompt, image_file_name=undefined) {
  var stim = observation1_task (domain, vals, prompt, image_file_name)
  timeline.push(stim);
}

function add_timeline_values_example (timeline, domain, vals) {  
  var vals_ex_text = "<p>" + value_str (domain, vals) + "</p>"
  add_timeline_observation1 (timeline, domain, vals, vals_ex_text);
}

function add_timeline_causal_example_and_mc (timeline, domain, vals) {

  function causal_intro_task () {
    function cause_effect_str (link) {
      const direction = {gen: "the same", inh: "a different"}
      var s = 
        "have reason to believe that " + link.cause + "<b> causally influences </b>" +  link.effect + "." +
        " Specifically, <b>individuals with a low level of " + link.cause_naked + " will tend to have a " + 
        adjective_lo[link.polarity] + ' level of ' + link.effect_naked + "</b>" +
        " whereas <b>individuals with a high level of " + link.cause_naked + " will tend to have a " + 
        adjective_hi[link.polarity] + ' level of ' + link.effect_naked + "</b>."
        s = s + 
          " Because the two variables tend to vary in " + direction[link.polarity] +
          " direction, this is referred to as a <b>" + pos_neg[link.polarity] + " causal relation</b>."
      return (s)
   }
   //function cause_effect_str (link) {
   //   var verb = {gen: "increase", inh: "decrease"}
   //   verb = verb[link.polarity]
   //   var s = 
   //     "have reason to believe that <b>" + link.cause + " causally influences " +  link.effect + "." +
   //     " Specifically, as " + link.cause + " increases, " + 
   //     link.effect + " will tend to " + verb + "</b>."
   //   return (s)
   //}
 
   var causal_text = 
      "<h1>Causal Relations</h1>" +
      "<p>In addition, before starting your measurements you have reason to believe that the three variables are causally related to one another.</p>" +
      "<p>You " + cause_effect_str (domain.links[0]) + "</p>" +
      "<p>And you " + cause_effect_str (domain.links[1]) + "</p>" +
      "<p>Note that these relationships are only trends." + 
      " Both " + domain.links[0].effect + " and " + domain.links[1].effect + 
      " are influenced by other factors so they will not vary with their cause perfectly.</p>" +
      "<p>The next page presents a graphical image of the two causal relations.</p>";
    var causal_intro = { 
      type: jsPsychHtmlKeyboardResponse,
      stimulus: causal_text,
      prompt: continue_prompt
    }
    return (causal_intro) 
  }

  function causal_example_task () {
    function cause_effect_str (link) {
      var s = 
        "the <b>" + pos_neg[link.polarity] + "</b> relationship between " + link.cause_naked + " and " + link.effect_naked
      return (s)
    }
    var causal_ex_text = 
      "<p>The arrows represent " + cause_effect_str(domain.links[0]) + 
      " and " + cause_effect_str(domain.links[1]) + ".</p>"
    var causal_stim = observation1_task (domain, vals, causal_ex_text, domain.arrows_img)
    return (causal_stim)
  }

  function multiple_choice_intro () {
   var intro_text = 
      "<h1>Causal Knowledge Test</h1>" +
      "<p>We would now like you to ask you a few simple questions about what you just learned.</p>" +
      "<p>Please try to answer these questions correctly the first time.</p>" +
      "<p>But don't worry, if you make a mistake you'll have a chance to re-study the information and answer the questions.</p>"
    var intro_task = { 
      type: jsPsychHtmlKeyboardResponse,
      stimulus: intro_text,
      prompt: continue_prompt
    }
    return (intro_task)
  }

  function causes_of_q_text (vi) {
     return ("<b>What does " + domain.vars[vi].name + " cause?</b>")
   }
   
  function caused_by_q_text (vi) {
     return ("<b>What is " + domain.vars[vi].name + " caused by?</b>")
   }

  function qs_match (responses, role) { 
    function q1_match (responses, correct_responses) {
      //a.length === b.length &&
      //a.every((element, index) => element === b[index]);
      if (responses.length != correct_responses.length)
        return (false)
      var match = true
      for (let i = 0; i < correct_responses.length; i++) {
        if (responses[i] != correct_responses[i])
          match = false
      }
     return (match)
    } 
    var match = []
    for (let qi = 0; qi < domain.vars.length; qi++) {
      match[qi] = q1_match(responses[Object.keys(responses)[qi]], domain.vars[qi][role])
    }
    return (match.every(Boolean))
  }
  
  function cause_effect_questions (q_text_fun, role) {
    var questions = []
    for (let vi = 0; vi < domain.vars.length; vi++) {
      questions.push({
        prompt: q_text_fun(vi),
        options: domain.vars[vi].others, 
        horizontal: true, required: false
      })
    }
    var questions_task = {
      type: jsPsychSurveyMultiSelect,
      questions: questions,
      preamble: 
        "<p><b>For each question, select 0-2 responses. " + 
        " Note that for some questions the correct answer might be to leave all boxes unchecked.</b><p>",
      data: {exp_type: 'MC ' + role},
      on_finish: function (data) {
        data.correct = qs_match(data.response, role)
        data.json_resp =  JSON.stringify(data.response)
        console.log ("+++ MC " + role + " questions correct: " + data.correct)
      }
    }
    return (questions_task)
  }

  function polarity_questions() {
    //function question_hi(link) {
    //  let q_text = "<b>Does " + link.cause + " increase or decrease " + link.effect + "?</b>"
    //  let options = ["increase","decrease"]
    //  return ({prompt: q_text, options: options, horizontal: true, required: true})
    //}
    function question(link, cause_level) {
      let q_text =
        "Because of the " + pos_neg[link.polarity] + " causal relation between them, " +
        "<b>if an individual has a " + cause_level + " level of " + link.cause_naked + 
        " their level of " + link.effect_naked + " will tend to be:</b>"
      let options = ["low","high"]
      return ({prompt: q_text, options: options, horizontal: true, required: true})
    }
    var questions = []
    for (let li = 0; li < domain.links.length; li++) {
      questions.push(question(domain.links[li], "low"))
      questions.push(question(domain.links[li], "high"))
    }
    var questions_task = {
      type: jsPsychSurveyMultiChoice,
      questions: questions,
      preamble: "<p><b>For each question, select exactly 1 response.</b><p>",
      data: {exp_type: 'MC polarity'},
      on_finish: function (data) {
        function q_correct(link, adjective, resp) { 
          var correct = resp == adjective[link.polarity]
          console.log ("+++ MC polarity question correct: " + correct)
          return (correct)
        }
        data.correct = 
          q_correct (domain.links[0], adjective_lo, data.response.Q0) &&
          q_correct (domain.links[0], adjective_hi, data.response.Q1) &&
          q_correct (domain.links[1], adjective_lo, data.response.Q2) &&
          q_correct (domain.links[1], adjective_hi, data.response.Q3)
        data.json_resp =  JSON.stringify(data.response)
        console.log ("+++ MC polarity questions correct: " + data.correct)
     }
    }
    return (questions_task)
  }

  function feedback () {
    var last_trials = jsPsych.data.get().last(3).values()
    var correct = last_trials[0].correct && last_trials[1].correct && last_trials[2].correct
    //jsPsych.data.addProperties({correct: correct})
    if (correct) {
      var feedback_text = 
        "<h1>Congratulations! You answered all the questions correctly!</h1>" +
        "<h2>You are now ready to move on to the rest of the experiment.</h2>"      
    }
    else {
       var feedback_text = 
        "<h1>Sorry, you answered some of the questions incorrectly.</h1>" +
        "<p>When you continue you will be returned to the causal relationships screen.</p>" +
        "<p>After you re-study the causal relationships you'll have an opportunity to retake the test.</p>" +
        "<p>You must answer the test questions correctly in order to continue to the next part of the experiment.</p>"      
    }
    return (feedback_text)
  }
  
  var intro_task = causal_intro_task()
  var causal_stim = causal_example_task()
  var mc_intro = multiple_choice_intro()
  var qs_causes_task = cause_effect_questions(causes_of_q_text, "cause_of")
  var qs_caused_by_task = cause_effect_questions(caused_by_q_text, "caused_by")
  var qs_polarity_task = polarity_questions()
  var feedback_task = { 
    type: jsPsychHtmlKeyboardResponse,
    stimulus: feedback,
    prompt: continue_prompt,
  }
  var loop = {
    timeline: [
      intro_task, causal_stim, mc_intro,
      qs_causes_task, qs_caused_by_task,
      qs_polarity_task, feedback_task
    ],
    loop_function: function (data) {
      var last_trials = jsPsych.data.get().last(4).values()
      var correct = last_trials[0].correct && last_trials[1].correct && last_trials[2].correct
      return !correct
    }
  }
  timeline.push(loop)
}

function add_timeline_observations (timeline, domain) {
 var intro_text = 
    "<h1>Observational Stage</h1>" +
    "<p>We would now like you to observe the measurements for 32 individuals chosen at random.</p>" +
    "<p>On the basis of these observations, we'd like you to form an impression of how often the measured variables take on different values.</p>" +
    "<p>And please form an impression of the strength of the causal relations between " + domain.links[0].cause + " and " + domain.links[0].effect +
    " and between "  + domain.links[1].cause + " and " + domain.links[1].effect + ".</p>" +
    "<p>Each individual will be displayed on a separate page. Please study each individual carefully and then hit a key to move on to the next one.</p>";
  var intro_task = { 
    type: jsPsychHtmlKeyboardResponse, stimulus: intro_text, prompt: continue_prompt
  }
  timeline.push(intro_task);


  var data = jsPsych.randomization.shuffle(domain.data)
  var obs_tasks = []
  //for (let o = 0; o < domain.data.length; o++) {
  for (let o = 0; o < data.length; o++) {
    var wait_task =  {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: "Please wait. Measurements for individual " + (o + 1).toString() + " are loading...",
      trial_duration: debug_options.load_delay
    }
    var obs1_task = observation1_task (domain, data[o], "", domain.arrows_img)
    obs1_task.data = {exp_type: 'Observation', exp_stim: JSON.stringify(domain.data[o])}
    obs_tasks.push ({timeline: [wait_task, obs1_task]})
  }
  var obs_task = {timeline: obs_tasks, sample: {type: 'without-replacement'}}
  timeline.push(obs_task);
}

function add_timeline_test (timeline, domain) {
  function jitter_stim (stim) {
    for (let i = 0; i < stim.length; i++) {
      if (typeof stim[i] != "undefined") {
        stim[i] = Math.round (stim[i] + 10 * (Math.random() - .5))
      }
    }
    return (stim)
  } 
  
  var test_items = [
    // Markov (predict var 0)
    {stim: [undefined, 40, 30], query_var: 0},
    {stim: [undefined, 40, 50], query_var: 0},
    {stim: [undefined, 40, 70], query_var: 0},
    {stim: [undefined, 60, 30], query_var: 0},
    {stim: [undefined, 60, 50], query_var: 0},
    {stim: [undefined, 60, 70], query_var: 0},
    // Markov (predict var 2)
    {stim: [30, 40, undefined], query_var: 2},
    {stim: [50, 40, undefined], query_var: 2},
    {stim: [70, 40, undefined], query_var: 2},
    {stim: [30, 60, undefined], query_var: 2},
    {stim: [50, 60, undefined], query_var: 2},
    {stim: [70, 60, undefined], query_var: 2},
    // Transitive
    {stim: [undefined, undefined, 30], query_var: 0},
    {stim: [undefined, undefined, 50], query_var: 0},
    {stim: [undefined, undefined, 70], query_var: 0},
    {stim: [30, undefined, undefined], query_var: 2},
    {stim: [50, undefined, undefined], query_var: 2},
    {stim: [70, undefined, undefined], query_var: 2},
    // Middle
    {stim: [30, undefined, 40], query_var: 1},
    {stim: [50, undefined, 40], query_var: 1},
    {stim: [70, undefined, 40], query_var: 1},
    {stim: [30, undefined, 60], query_var: 1},
    {stim: [50, undefined, 60], query_var: 1},
    {stim: [70, undefined, 60], query_var: 1},
    // One link (predict 1)
    {stim: [30, undefined, undefined], query_var: 1},
    {stim: [50, undefined, undefined], query_var: 1},
    {stim: [70, undefined, undefined], query_var: 1},
    {stim: [undefined, undefined, 30], query_var: 1},
    {stim: [undefined, undefined, 50], query_var: 1},
    {stim: [undefined, undefined, 70], query_var: 1},
    // One link (predict 0)
    {stim: [undefined, 30, undefined], query_var: 0},
    {stim: [undefined, 50, undefined], query_var: 0},
    {stim: [undefined, 70, undefined], query_var: 0},
    // One link (predict 2)
    {stim: [undefined, 30, undefined], query_var: 2},
    {stim: [undefined, 65, undefined], query_var: 2},
    {stim: [undefined, 70, undefined], query_var: 2}
  ]
  var test_intro_text = 
    "<h1>Prediction Stage</h1>" + 
    "<p>On the basis of what you just learned, we would now like you to make predictions about a new group of individuals.</p>" +
    "<p>For each individual we know the level of some of the variables but some of the measurements are missing." +
    " We'd like you to predict the value of one of the missing measurements.</p>" +
    "<p>We'd like you to make predictions for " + test_items.length + " individuals.</p>"
  var cp_intro = { 
    type: jsPsychHtmlKeyboardResponse,
    stimulus: test_intro_text,
    prompt: continue_prompt
  };
  timeline.push(cp_intro);
  
  test_items = jsPsych.randomization.shuffle(test_items)
  var test_tasks = []
  for (let o = 0; o < test_items.length; o++) {
    var wait_task =  {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: "Please wait. The next test individual is loading. (This may take a few seconds.)",
      trial_duration: debug_options.load_delay
    }
    timeline.push(wait_task);
    
    test_items[o].stim = jitter_stim (test_items[o].stim)
    if (typeof test_items[o].stim[test_items[o].query_var] != "undefined") {
      const err_msg = "Invalid test item " + o
      console.log(err_msg)
      crash(err_msg, p_info)
    }
    var prompt = 
      "<p>" + value_str(domain, test_items[o].stim) +
      " Given this information, <b>what is your best estimate for their " + 
      domain.vars[test_items[o].query_var].name + " level?</b></p>"
    var test_item = {
      type: jsPsychCanvasSliderResponse,
      labels: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
      require_movement: debug_options.require_movement,
      canvas_size: canvas_size,
      stimulus: function (c) {
        draw_continuous_stim(c, domain, test_items[o].stim, domain.arrows_img)
      },
      prompt: prompt,
      data: {exp_type: 'Inference', exp_stim: JSON.stringify(test_items[o])}
    }
    test_tasks.push (test_item)
  }
  //var test_task = {timeline: test_tasks, sample: {type: 'without-replacement'}}
  var test_task = {timeline: test_tasks}
  timeline.push(test_task);
}

function add_timeline_debrief_and_survey(timeline) {
  var debrief_text = 
    "<h1>Almost done! </h1>" +   
    "<h2>Proceed to the next page to read about the purpose of this experiment.</h2>" + 
    "<h2>You will then be asked to complete a short survey.</h2>"
  var almost_done_task = { 
    type: jsPsychHtmlKeyboardResponse, stimulus: debrief_text, prompt: continue_prompt
  }
  timeline.push(almost_done_task);

  var debrief_trial = {
    type: jsPsychExternalHtml, url: "debrief.html", cont_btn: "start"
  }
  timeline.push(debrief_trial)
  
  var debrief_text = 
    "<b>Do you feel that you have been adequately debriefed about the nature of the study,"+
    " that the investigators have explained the purposes of the research," +
    " and that you have been given the information needed to ask the investigators followup questsion?" +
    " (Note that you must respond 'yes' in order to receive credit for the experiment at this time.)</b>"
  var options = [
    "Yes", 
    "No, please withhold my data. I will contact the experimenter with questions."
  ] 
  var debrief_question = {prompt: debrief_text, options: options, horizontal: true, required: true}
  
  var hedge = 
    " (Remember that all responses are anonymous and so we would appreciate your honest answer." +
    " Nevertheless, you may skip this question if you prefer.),</b>"

  var engag_text = 
    "<b>On a scale of 1-10, please rate how ENGAGING you found this experiment" +
    " (1 = least engaged; 10 = most)." + hedge
  var options = ["1","2","3","4","5","6","7","8","9","10"]
  var engag_question = {prompt: engag_text, options: options, horizontal: true, required: false}

  var diff_text = 
    "<b>On a scale of 1-10, please rate how DIFFICULT you found this experiment" +
    " (1 = least difficult; 10 = most)." + hedge
  var diff_question = {prompt: diff_text, options: options, horizontal: true, required: false}

  var confirm_trial = {
    type: jsPsychSurveyMultiSelect,
    questions: [debrief_question, engag_question, diff_question],
    on_finish: function (data) {
      data.release_users_data = data.response.Q0[0] == "Yes"
    }
  }
  timeline.push(confirm_trial)
}

function add_timeline_write_data(timeline, p_info) {
  
  function done_text_fun() {
    var last_trials = jsPsych.data.get().last(2).values()
    var release_users_data = last_trials[0].release_users_data
    var done_text =   
      "<h1>Thank you for participating in this experiment!</h1>" +
      "<h2>We very much appreciate your contribution to our research!</h2>"
    if (release_users_data) {
      done_text = "<h1>Your data has been saved!</h1>" + done_text
      if (p_info.prolific) {   
        done_text = 
          done_text + 
          "<h2><a href=" + prolific_url +
          ">Click here to return to Prolific and complete the study</a>.</h2>" +
          "<h2>To complete the study you will need this Prolific code: " + 
          prolific_completion_code + "</h2>"    
      }
    }
    return (done_text)
  }  

  var write_data_to_server_task = {
    type: jsPsychCallFunction,
    async: true,
    func: function (done) {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', app_url + '/resultssave');
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.onload = function() {
        var response = xhr.responseText
        if(xhr.status == 200){
          response = JSON.parse(response)
          if ('log_message' in response) {
            console.log(response.log_message)
          }
          console.log("+++ Successfully stored data for subject " + p_info.pid)
        } else {
          const err_msg = "Server error: Code = " + xhr.status + ", message = " + response
          console.log(err_msg)
          crash(err_msg, p_info)
          //throw Error(err_msg)
        }
        done()
      }
      var exp_results = {p_info: p_info, trials: jsPsych.data.get().trials}
      exp_results = JSON.stringify(exp_results)
      xhr.send(exp_results)
    } 
  }
  timeline.push (write_data_to_server_task)
  
  var done_task = { 
    type: jsPsychHtmlKeyboardResponse, stimulus: done_text_fun, choices: "NO_KEYS"
  }
  timeline.push(done_task);
}

function add_timeline_domain(timeline, p_info, domain) {
  if (debug_options.consent) {
    add_timeline_fullscreen(timeline, p_info)
    add_timeline_consent(timeline)
  }
  add_preload_task (timeline, [var_image_file, domain.arrows_img])  
  var example_vals = [58, 37, 41]
  add_timeline_intro(timeline, domain) 
  add_timeline_values_example(timeline, domain, example_vals)
  add_timeline_causal_example_and_mc(timeline, domain, example_vals)
  if (!debug_options.skip_meat) {
    add_timeline_observations(timeline, domain)
    add_timeline_test(timeline, domain)  
  }  
  add_timeline_debrief_and_survey(timeline)
  add_timeline_write_data(timeline, p_info)
}

export function participant_ids() {
  // Generate internal participant id  etc. 
  const pid = jsPsych.randomization.randomID(8)
  
  // Prolfiic
  var prolific_info = {
    prolific_id: jsPsych.data.getURLVariable('PROLIFIC_PID'),
    study_id: jsPsych.data.getURLVariable('STUDY_ID'),
    session_id: jsPsych.data.getURLVariable('SESSION_ID')
  }
  // For debugging...
  if (typeof prolific_info.prolific_id == "undefined") {
    prolific_info = {
      prolific_id: jsPsych.randomization.randomID(8), study_id: "Fill", session_id: "Fill"
    }
  }

  return({
    pid: pid, 
    prolific: typeof prolific_info.prolific_id != "undefined",
    prolific_info: prolific_info
  })
}

export function create_timeline(p_info) {

  function make_domain(domain_vars, cbn, polarity, data, image_file) {
  
    function other_var_names (vi) {
      var others_s = []
      for (let vi2 = 0; vi2 < domain_vars.length; vi2++) {
        if (vi2 != vi) {
          others_s.push (domain_vars[vi2])
        }
      }
      return (others_s)
    }
    
    function cause_of_var_names (vi) {
      var causes_of = []
      for (let li = 0; li < cbn.links.length; li++) {
        if (cbn.links[li].cause == vi) {
          causes_of.push (domain_vars[cbn.links[li].effect])
        }
      }
      return (causes_of)
    }
    
   function caused_by_var_names (vi) {
      var caused_by = []
      for (let li = 0; li < cbn.links.length; li++) {
        if (cbn.links[li].effect == vi) {
          caused_by.push (domain_vars[cbn.links[li].cause])
        }
      }
      return (caused_by)
    }
    
    var vars = []
    for (let vi = 0; vi < domain_vars.length; vi++) {
      vars.push({
        name: domain_vars[vi],
        long_name: "the level of " + domain_vars[vi],
        others: other_var_names(vi),
        cause_of: cause_of_var_names(vi),
        caused_by: caused_by_var_names(vi)
      })
    }
    var links = []
    for (let li = 0; li < cbn.links.length; li++) {
      links.push({
        cause_naked: vars[cbn.links[li].cause].name,
        effect_naked: vars[cbn.links[li].effect].name,
        cause: vars[cbn.links[li].cause].long_name,
        effect: vars[cbn.links[li].effect].long_name,
        polarity: polarity[li]
      })
    }
    return {vars: vars, links: links, arrows_img: image_file, data: data}
  }
  
  function server_message (route, content) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', app_url + route, false);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(content))
    var response = xhr.responseText
    if(xhr.status == 200) {
     response = JSON.parse(response)
     if ('log_message' in response) {
       console.log(response.log_message)
     }
    } else {
      const err_msg = "Server error: Code = " + xhr.status + ", message = " + response
      console.log(err_msg)
      crash(err_msg, p_info)
    }
    return(response)
  }
   
  function cell_allocation_test() {
    const dummy_trial = {exp_type: 'TBD', exp_type: 'XXX', rt: 666, response: "WTF"}
    const dummy_trials = [dummy_trial, dummy_trial]
    for (let i=0; i < 20; i++) {
      var p_info = {pid: jsPsych.randomization.randomID(8), prolific: false}
      var get_message = {design: full_design, p_info: p_info}
      var cell = server_message ('/getcell', get_message)
      var put_message = {p_info: p_info, trials: dummy_trials}
      server_message ('/resultssave', put_message)
    }
  }

  // Get experimental cell from server.  
  const full_design = jsPsych.randomization.factorial(factors, 1)
  const message = {design: full_design, p_info: p_info}
  p_info.cell = server_message ('/getcell', message)
  
  //p_info.cell.polarity = 'gen_inh'
  //p_info.cell.domain = 'absorption'

  console.log ("+++ Cell assigned: " + JSON.stringify(p_info.cell))
  
  //cell_allocation_test()

  const cbn = 'cc3'
  const domain = make_domain (
    domains_vars[p_info.cell.domain],
    cbns[cbn],
    polarities[p_info.cell.polarity],
    cbns[cbn].data[p_info.cell.polarity],
    cbns[cbn].image_files[p_info.cell.polarity]
  )
  var timeline = []
  add_timeline_domain (timeline, p_info, domain)
  console.log ("+++ Created jspsych timeline of length " + timeline.length)
  return(timeline)
}

export function crash(err_msg, pids) {
  const expt_info = {err_msg: err_msg, pids: pids}
  localStorage.setItem("expt_info", JSON.stringify(expt_info))
  console.log (expt_info)
  window.location.href = app_url + "/error.html"
  throw Error(err_msg) 
}
