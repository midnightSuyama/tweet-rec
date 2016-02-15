<schedule>
  <div id="window" class="window">
    <header class="toolbar toolbar-header">
      <div class="header-items">
        <div>
          <button class="btn btn-default" onclick={ hide }><span class="icon icon-left-open"></span></button>
        </div>
        <div class="label">
          <strong>Schedule</strong>
        </div>
        <div>
          <button class="btn btn-default" onclick={ showForm }><span class="icon icon-plus"></span></button>
        </div>
      </div>
    </header>
    
    <div class="window-content">
      <ul class="list-group">
        <li each={ global.state.schedules } class="list-group-item { active: id == activeId } { recording: isRecording }" onclick={ showForm }>
          <strong>{ date.replace(/-/g, '/') } { beginTime } - { endTime }</strong>
          <p>#{ word }</p>
        </li>
      </ul>
    </div>
  </div>

  <schedule-form></schedule-form>
  
  <style scoped>
    :scope {
      display: none;
      z-index: 1;
      position: fixed;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
    }

    .window {
      position: absolute;
      top: 0;
      left: -240px;
      width: 240px;
      height: 100%;
      border-right: 1px solid #c2c2c2;
      box-shadow: 1px 0 1px rgba(0, 0, 0, 0.6);
    }

    .header-items {
      display: flex;
      align-items: center;
      padding: 6px;
    }
    .header-items .label {
      flex: 1;
      text-align: center;
    }

    .list-group-item:last-child {
      border-bottom: 1px solid #ddd;
    }

    .recording {
      background: #f00;
      pointer-events: none;
    }
  </style>

  <script>
    const TweenMax = require('gsap/src/minified/TweenMax.min.js')
    
    show() {
      this.root.style.display = 'block'
      TweenMax.fromTo(this.root, 0.6, { backgroundColor: 'rgba(0, 0, 0, 0)' }, { backgroundColor: 'rgba(0, 0, 0, 0.6)' })
      TweenMax.fromTo(this.window, 0.6, { x: '-100%' }, { x: '100%' })
    }
    
    hide() {
      TweenMax.to(this.window, 0.6, { x: '-100%' })
      TweenMax.to(this.root, 0.6, { backgroundColor: 'rgba(0, 0, 0, 0)', onComplete: () => {
        this.root.style.display = 'none'
      }})
    }

    showForm(e) {
      let scheduleForm = this.tags['schedule-form']
      if (e.item) {
        this.activeId = e.item.id
        scheduleForm.show(e.item)
      } else {
        scheduleForm.show()
      }
    }
    
    riot.mixin('schedule', {
      showSchedule: () => this.show(),
      hideSchedule: () => this.hide()
    })
  </script>
</schedule>
