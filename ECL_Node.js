const { Pool } = require('pg')
const {
  string_separated_array, comma_separated_array, quote, val_w_default
} = require('./strutils.js')
const {
   create_table, test_and_create_table, insert_table, table_empty, 
   table_exists, delete_table, update_table, 
   test_and_create_database, delete_database
} = require('./database.js')
​
const good_code = 200
const internal_error = 500
​
// Define database tables.
const cells_table = {
  name: 'cells',
  col_types: {cell: 'VARCHAR UNIQUE', allocated: 'INTEGER', completed: 'INTEGER'}   
}
    
const subjects_table = {
  name: 'subjects',
  col_types: {pid: 'VARCHAR UNIQUE', cell: 'VARCHAR', state: 'VARCHAR'}   
}
    
const events_table = {
  name: 'events',
  col_types: {pid: 'VARCHAR', event: 'VARCHAR', time: 'VARCHAR'}   
}
    
const trials_table = {
  name: 'trials',
  col_types: {
    pid: 'VARCHAR', trial_no: 'INTEGER', type: 'VARCHAR', stim: 'VARCHAR', 
    resp: 'VARCHAR', json_resp: 'VARCHAR', rt: 'INTEGER', jspsych: 'VARCHAR'
  }
}    
​
const prolific_table = {
  name: 'prolific',
  col_types: {
    pid: 'VARCHAR UNIQUE', prolific_id: 'VARCHAR UNIQUE', study_id: 'VARCHAR', session_id: 'VARCHAR'
  }   
}
    
const database = [cells_table, subjects_table, events_table, trials_table, prolific_table]
    
async function update_cell_table(cell_json, update_clause) {
  where_clause = "cell = " + quote (cell_json)
  await update_table(pool, cells_table, update_clause, [where_clause])
}
​
async function test_and_initialize_database(design) {
  await test_and_create_database(pool, database)
 
  // Copy (json strings of) cells into cells table
  if (await table_empty(pool, cells_table)) {
    // Initialize table with cells.
    for (let i=0; i < design.length; i++) {
      insert_vals = [quote(JSON.stringify(design[i])), 0, 0]
      insert_table(pool, cells_table, insert_vals)
    }
    console.log ('*** Table ' + cells_table.name + ' initialized')
  }
}
​
async function get_cell(req) {
  // If database doesn't already exist, create it.
  await test_and_initialize_database(req.body.design)
  
  const p_info = req.body.p_info
​
  // Allocate cell to subject.
  // First identify the least allocated cells.
  query = 'SELECT MIN(completed) as min FROM ' + cells_table.name + ';'
  var result = await pool.query(query)
  query = 'SELECT * FROM ' + cells_table.name + ' WHERE completed=' + result.rows[0].min + ';'
  var result = await pool.query(query)
  // Randomly pick on of the least allocated cells.
  idx = Math.floor(Math.random() * result.rows.length)
  var cell_json = result.rows[idx].cell
​
  // Update cell's allocation count.
  await update_cell_table(cell_json, "allocated = allocated + 1")
  console.log ("*** Cell " + cell_json + " allocated to " + p_info.pid)
  
  // Add new subject to subjects table.
   insert_vals = [p_info.pid, cell_json, 'started']
  await insert_table(pool, subjects_table, insert_vals.map(quote))
  console.log("*** Subject " + p_info.pid + " added to " + subjects_table.name + " table")    
​
  // Add start event to events table.
  insert_vals = [p_info.pid, 'started', new Date().toUTCString()]
  await insert_table(pool, events_table, insert_vals.map(quote))
  console.log("*** Start event for subject " + p_info.pid + " added to " + events_table.name + " table")    
​
  // Add new subject to Prolific table with if necessary. 
  if (p_info.prolific) {
    insert_vals = [p_info.pid]
    prolific_vals = Object.values(p_info.prolific_info) 
    insert_vals = insert_vals.concat(prolific_vals)
    await insert_table(pool, prolific_table, insert_vals.map(quote))
    console.log("*** Subject " + p_info.pid + " added to " + prolific_table.name + " table")
  }
​
  return(cell_json)
}
​
async function write_exp_data(req) {
  async function write_one_trial (trial_no, trial) {
    if ('stimulus' in trial) {
      trial.stimulus = trial.stimulus.substring(0, 31) + "..."
    } 
    insert_vals = [
      pid_s, trial_no,
      quote (val_w_default(trial.exp_type, "")),
      quote (val_w_default(trial.exp_stim, "")),
      quote (val_w_default(trial.response, "")),
      quote (val_w_default(trial.json_resp, "")),
      val_w_default(trial.rt, 0),
      quote(JSON.stringify(trial))
    ]
    await insert_table(pool, trials_table, insert_vals)
  }
​
  const p_info = req.body.p_info
  const pid_s = quote(p_info.pid)
​
  // Update trials table.
  var trials = req.body.trials
  for (let ti = 0; ti < trials.length; ti++) {
    write_one_trial (ti, trials[ti])
  }  
  console.log ("*** %d trials written to table " + trials_table.name, trials.length)
​
  // Update subjects table. 
  const update_clause = "state = 'completed'"
  await update_table(pool, subjects_table, update_clause, ["pid=" + pid_s])
  console.log ("*** Subject " + p_info.pid + " logged as completed in " + subjects_table.name + " table")
  
  // Add completion event to events table.
  insert_vals = [p_info.pid, 'completed', new Date().toUTCString()]
  await insert_table(pool, events_table, insert_vals.map(quote))
  console.log("*** Completion event for subject " + p_info.pid + " added to " + events_table.name + " table")    
​
  // Update cells.
  //console.log ("*** Updating counts in table " + cells_table.name)
  const cell_json = JSON.stringify(p_info.cell)
  await update_cell_table(cell_json, "completed = completed + 1")
  console.log ("*** Counts in table " + cells_table.name + " updated")
}
​
// Main
​
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})
​
var express = require("express")
var app = express()
app.use(express.json())
app.use(express.static (__dirname + "/public"))
app.engine("html", require("ejs").renderFile)
app.set("view engine","html")
​
app.get ("/", function (req, res) {
  console.log ('*** Responding to initial client request')
  req.render ("index.html")
})
​
app.post('/resetdb', async (req, res) => { 
  try {
    //await delete_database(database)
    res.status(good_code).send(JSON.stringify({log_message: '### Database reset'}))
  } catch (err) {
    console.error("*** Handling error in resetdb dbtest...")
    console.error(err);
    res.status(internal_error).send(err.message)
  }
})  
​
app.post('/dbtest', async (req, res) => { 
  try {
    await initialize_database(req)
    res.status(good_code).send(JSON.stringify({log_message: '### Database ready'}))
  } catch (err) {
    console.error("*** Handling error in route dbtest...")
    console.error(err);
    res.status(internal_error).send(err.message)
  }
})  
​
app.post('/getcell', async (req, res) => { 
  try {
    var cell_json = await get_cell (req)
    res.status(good_code).send(cell_json)
  } catch (err) {
    console.error("*** Handling error in route getcell...")
    console.error(err)
    //var err_s = JSON.stringify({msg: err.message, err: err})
    res.status(internal_error).send(err.message)
  }
})  
​
app.post('/resultssave', async (req, res) => { 
  try {
    await write_exp_data(req)
    res.status(good_code).send(JSON.stringify({log_message: '### Data stored successfully'}))
  } catch (err) {
    console.error("*** Handling error in route resultssave...")
    console.error(err)
    res.status(internal_error).send(err.message)
  }
})  
​
var server = app.listen (process.env.PORT, function () {
  console.log ("*** Listening to port %d", server.address().port)
})