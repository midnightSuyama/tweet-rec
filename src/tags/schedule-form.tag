<schedule-form>
  <div id="dialog" class="dialog">
    <h2>REC</h2>

    <form onsubmit={ submit }>
      <div class="form-group">
        <label>DateTime</label>
        <input type="date" class="form-control" value={ date } onchange={ editDate }>
        <div class="input-group">
          <input type="time" class="form-control" value={ beginTime } onchange={ editBeginTime }>
          <div>-</div>
          <input type="time" class="form-control" value={ endTime } onchange={ editEndTime }>
        </div>
      </div>

      <div class="form-group">
        <label>Hashtag</label>
        <div class="input-group">
          <div>#</div>
          <input type="text" class="form-control" value={ word } onkeyup={ editWord }>
        </div>
      </div>
      
      <div class="form-actions">
        <button type="button" class="btn btn-default" onclick={ delete } disabled={ id == null }><span class="icon icon-trash"></span></button>
        <div class="pull-right">
          <button type="button" class="btn btn-form btn-default" onclick={ hide }>Cancel</button>
          <button type="submit" class="btn btn-form btn-primary" disabled={ !validate() }>OK</button>
        </div>
      </div>
    </form>
  </div>

  <style scoped>
    :scope {
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 2;
      position: fixed;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
    }

    .dialog {
      display: block;
      position: relative;
      width: 280px;
      height: 440px;
      padding: 20px;
      border: 1px solid #c2c2c2;
      border-radius: 4px;
      box-shadow: 0 1px 1px rgba(0, 0, 0, 0.6);
      background: #f5f5f5;
    }

    h2 {
      margin: 0 0 20px;
      text-align: center;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    .form-group > :not(label) {
      margin-bottom: 10px;
    }
    .form-group > label {
      font-weight: bold;
    }

    .input-group {
      display: flex;
      align-items: center;
    }
    .input-group > :not(:first-child) {
      margin-left: 6px;
    }
    .input-group > input {
      flex: 1;
    }

    .form-actions {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      padding: 20px;
    }
  </style>

  <script>
    const actions = require('./actions')
    
    const init = (schedule=null) => {
      this.id = null
      this.date = this.beginTime = this.endTime = this.word = ''
      
      if (schedule) {
        this.update(schedule)
      }
    }
    
    show(schedule=null) {
      init(schedule)

      this.root.style.display = 'flex'
      TweenMax.fromTo(this.root, 0.3, { backgroundColor: 'rgba(0, 0, 0, 0)' }, { backgroundColor: 'rgba(0, 0, 0, 0.6)' })
      TweenMax.fromTo(this.dialog, 0.3, { alpha: 0, scale: 0.9 }, { alpha: 1, scale: 1.0 })
    }

    hide() {
      this.parent.update({ activeId: null })
      
      TweenMax.to(this.dialog, 0.3, { alpha: 0, scale: 0.9 })
      TweenMax.to(this.root, 0.3, { backgroundColor: 'rgba(0, 0, 0, 0)', onComplete: () => {
        this.root.style.display = 'none'
      }})
    }
    
    editDate(e) {
      this.date = e.target.value
    }
    
    editBeginTime(e) {
      this.beginTime = e.target.value
    }
    
    editEndTime(e) {
      this.endTime = e.target.value
    }
    
    editWord(e) {
      this.word = e.target.value
    }
    
    validate() {
      const regexpDate = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/
      if (!this.date.match(regexpDate)) return false
      
      const regexpTime = /^([01]\d|2[0-3]):[0-5]\d$/
      if (!this.beginTime.match(regexpTime)) return false
      if (!this.endTime.match(regexpTime)) return false
      if (this.beginTime == this.endTime) return false
      
      if (this.word.length == 0) return false
      
      return true
    }

    submit() {
      let schedule = {
        id:        this.id,
        date:      this.date,
        beginTime: this.beginTime,
        endTime:   this.endTime,
        word:      this.word
      }
      let action = schedule.id ? actions.updateSchedule(schedule) : actions.addSchedule(schedule)
      ipcRenderer.send('dispatch-action', action)
      this.hide()
    }

    delete() {
      ipcRenderer.send('dispatch-action', actions.deleteSchedule(this.id))
      this.hide()
    }
  </script>
</schedule-form>
