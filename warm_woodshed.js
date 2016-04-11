// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @include      http://g.miaowu.asia/
// @grant        none
// ==/UserScript==

function ButlerException(msg) {
    this.message = msg;
}


function Event(name) {
    this.name = name;
    this.handlers = [];
}

Event.prototype.register = function (handler) {
    if (this.handlers.indexOf(handler) < 0) {
        this.handlers.push(handler);
    }
};

Event.prototype.unregister = function (handler) {
    var index = this.handlers.indexOf(handler);
    if (index >= 0) {
        this.handlers.splice(index, 1);
    }
};

Event.prototype.notify = function (sender, arg) {
    this.handlers.forEach(function (handler) {
        try {
            handler.call(sender, this.name, arg);
        } catch (e) {

        }
    });
};

Event.prototype.clear = function () {
    this.handlers = [];
};


function Controler(element) {
    this.element = element;
}

function getControlerFromId (id) {
    var elements = document.getElementById(id);

    if (elements) {
        return new Controler(elements);
    }
    return undefined;
}

Controler.prototype.isDisabled = function () {
    if (this.element.className.search("disabled") >= 0) {
        return true;
    }
    return false;
};

Controler.prototype.activate = function () {
    this.element.click();
};

Controler.prototype.tryActivate = function () {
    if (!(this.isDisabled())) {
        this.activate();
    }
};


function Butler(tick, lightInterval) {
    this.tick = tick;
    this.lightInterval = lightInterval;
    this.events = {
        onStart: new Event("onStart"),
        onInterval: new Event("onInterval"),
        onStop: new Event("onStop"),
    };
    this.timer = undefined;
    this.controlers = undefined;
    this.Interval = 0;
}

Butler.prototype.start = function () {
    if (this.timer) {
        throw new ButlerException("timer is not empty");
    }

    this.controlers = getControlers();
    this.Interval = 0;

    this.events.onStart.notify(this);

    this.timer = activateInterval(this);
    this.events.onInterval.register(function () {
        this.Interval += 1;
    });
};

Butler.prototype.stop = function () {
    if (this.timer === undefined) {
        throw new ButlerException("this is empty");
    }
    this.events.onStop.notify(this);

    clearInterval(this.timer);
    this.timer = undefined;
};

Butler.prototype.auto_check = function () {
    this.events.onInterval.register(function () {
        this.controlers.gather.tryActivate();

        if (this.controlers.traps === undefined) {
            this.controlers.traps = getControlerFromId("trapsButton");

        }
        this.controlers.traps.tryActivate();

        if (this.Interval % this.lightInterval === 0) {
            this.controlers.light.tryActivate();
        }
    });
};


function getControlers() {
    return {
        light: getControlerFromId("lightButton"),
        gather: getControlerFromId("gatherButton"),
        traps: getControlerFromId("trapsButton"),
    };
}

function activateInterval(butler) {
    var interval_events = butler.events.onInterval;
    return setInterval(function () {
        interval_events.notify(butler);
    }, butler.tick);
}

(function main() {
    var butler = new Butler(500, 30);
    butler.start();
    butler.auto_check();
})();
