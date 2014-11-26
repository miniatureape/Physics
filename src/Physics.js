define([
  'ParticleSystem',
  'requestAnimationFrame',
  'common'
], function(ParticleSystem, raf, _) {

  var updates = [];

  /**
   * Extended singleton instance of ParticleSystem with convenience methods for
   * Request Animation Frame.
   * @class
   */
  var Physics = function() {

    var _this = this;

    this.playing = false;

    ParticleSystem.apply(this, arguments);

    this.animations = [];

    this.equilibriumCallbacks = [];

    update.call(this);

  };

  _.extend(Physics, ParticleSystem, {

    superclass: ParticleSystem

  });

  _.extend(Physics.prototype, ParticleSystem.prototype, {

    /**
     * Play the animation loop. Doesn't affect whether in equilibrium or not.
     */
    play: function() {

      if (this.playing) {
        return this;
      }

      this.playing = true;
      this.__equilibrium = false;
      update.call(this);

      return this;

    },

    /**
     * Pause the animation loop. Doesn't affect whether in equilibrium or not.
     */
    pause: function() {

      this.playing = false;
      return this;

    },

    /**
     * Toggle between playing and pausing the simulation.
     */
    toggle: function() {

      if (this.playing) {
        this.pause();
      } else {
        this.play();
      }

      return this;

    },

    onUpdate: function(func) {

      if (_.indexOf(this.animations, func) >= 0 || !_.isFunction(func)) {
        return this;
      }

      this.animations.push(func);

      return this;

    },

    onEquilibrium: function(func) {

      if (_.indexOf(this.equilibriumCallbacks, func) >= 0 || !_.isFunction(func)) {
        return this;
      }

      this.equilibriumCallbacks.push(func);

      return this;

    },

    /**
     * Call update after values in the system have changed and this will fire
     * it's own Request Animation Frame to update until things have settled
     * to equilibrium — at which point the system will stop updating.
     */
    update: function() {

      if (!this.__equilibrium) {
        return this;
      }

      this.__equilibrium = false;
      if (this.playing) {
        update.call(this);
      }

      return this;

    }

  });

  function update() {

    var _this = this, i;

    this.tick();

    for (i = 0; i < this.animations.length; i++) {
      this.animations[i]();
    }

    if ((this.__optimized && !this.__equilibrium || !this.__optimized) && this.playing) {

      raf(function() {
        update.call(_this);
      });

    }

    if (this.__optimized && this.__equilibrium){

      for (i = 0; i < this.equilibriumCallbacks.length; i++) {
        this.equilibriumCallbacks[i]();
      }

    }

  }

  return Physics;

});
