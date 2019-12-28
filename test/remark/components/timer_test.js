var EventEmitter = require('events').EventEmitter
  , Timer = require('components/timer')
  ;

describe('Timer', function () {
  var events
    , element
    , timer
    ;

  beforeEach(function () {
    events = new EventEmitter();
    element = document.createElement('div');
  });

  describe('timer events', function () {
    beforeEach(function () {
      timer = new Timer(events, element);
    });

    it('should be in an initial state', function () {
      timer.state.should.equal(timer.INITIAL);
    });

    it('should respond to a startTimer event', function () {
      events.emit('startTimer');

      timer.state.should.equal(timer.RUNNING);
    });

    it('should respond to a pauseTimer event', function () {
      events.emit('pauseTimer');

      timer.state.should.equal(timer.PAUSED);
    });

    it('should respond to a toggleTimer event', function () {
      events.emit('toggleTimer');

      timer.state.should.equal(timer.RUNNING);

      events.emit('toggleTimer');

      timer.state.should.equal(timer.PAUSED);

      events.emit('toggleTimer');

      timer.state.should.equal(timer.RUNNING);
    });

    it('should respond to a resetTimer event', function () {
      events.emit('resetTimer');

      timer.state.should.equal(timer.INITIAL);
    });

    describe('sequence of events', function () {
      it('should be in a correct state after startTimer, pauseTimer', function () {
        ['startTimer', 'pauseTimer'].forEach(function (event) {
          events.emit(event);
        });

        timer.state.should.equal(timer.PAUSED);
      });

      it('should be in a correct state after startTimer, resetTimer', function () {
        ['startTimer', 'resetTimer'].forEach(function (event) {
          events.emit(event);
        });

        timer.state.should.equal(timer.INITIAL);
      });

      it('should be in a correct state after startTimer, pauseTimer, startTimer', function () {
        ['startTimer', 'pauseTimer', 'startTimer'].forEach(function (event) {
          events.emit(event);
        });

        timer.state.should.equal(timer.RUNNING);
      });

      it('should be in a correct state after startTimer, pauseTimer, resetTimer', function () {
        ['startTimer', 'pauseTimer', 'resetTimer'].forEach(function (event) {
          events.emit(event);
        });

        timer.state.should.equal(timer.INITIAL);
      });
    });
  });

  describe('tick', function () {
    beforeEach(function () {
      timer = new Timer(events, element);
    });

    it('timer in INITIAL state does not progresses the elapsed time', function (done) {
      setTimeout(function () {
        timer.tick();

        timer.chronos.elapsedTime.should.equal(0);
        done();
      })
    });

    it('timer in RUNNING state progresses the elapsed time', function (done) {
      events.emit('startTimer');

      setTimeout(function () {
        timer.tick();

        timer.chronos.elapsedTime.should.be.above(0);
        done();
      })
    });

    it('timer in PAUSED state does not progresses the elapsed time', function (done) {
      events.emit('pauseTimer');

      setTimeout(function () {
        timer.tick();

        timer.chronos.elapsedTime.should.equal(0);
        done();
      })
    });
  });

  describe('view', function () {
    var millis = 1,
      seconds = 1000 * millis,
      minutes = 60 * seconds,
      hours = 60 * minutes;

    it('defaults to hh:mm:ss', function () {
      timer = new Timer(events, element);
      timer.chronos.elapsedTime = 1 * hours + 23 * minutes + 45 * seconds + 678 * millis;

      timer.tick();

      element.innerHTML.should.equal('01:23:45');
    })

    it('defaults view can be overriden', function () {
      timer = new Timer(events, element, {
        timer: {
          formatter: function (elapsedTime) {
            var left = elapsedTime;
            var millis = left % 1000; left = Math.floor(left / 1000);
            var seconds = left % 60; left = Math.floor(left / 60);
            var minutes = left;

            return [minutes, seconds]
              .map(function (d) { return '' + d; })
              .map(function (s) { return padStart(s, 2, '0'); })
              .join(':');
          }
        }
      });
      timer.chronos.elapsedTime = 1 * hours + 23 * minutes + 45 * seconds + 678 * millis;

      timer.tick();

      element.innerHTML.should.equal('83:45');
    })

    it('can be disabled', function () {
      timer = new Timer(events, element, {
        timer: {
          enabled: false
        }
      });
      timer.chronos.elapsedTime = 1 * hours + 23 * minutes + 45 * seconds + 678 * millis;

      timer.tick();

      element.innerHTML.should.equal('');
    })
  });
});

function padStart(s, length, pad) {
  var result = s;
  while (result.length < length) {
    result = pad + result;
  }
  return result;
}