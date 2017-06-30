(function() {
    // pseudo-constants
    var VERSION = "2.3.4 (GitHub)";
    var LOG_DEBUG = false;
    var LOG_TYPING_INFO = false;
    var DO_BAN_CHECK = true;
    var LOAD_TIME = 4300;
    var TURBO_PACKET_COUNT = 5;
    var TURBO_PACKET_IDX = 1500;
    var FONT = '<link href="https://fonts.googleapis.com/css?family=Ubuntu" rel="stylesheet">';

    var _clear = console.clear;
    var _title = "Nitro Type Race";
    var accuracy = gen(0.80, 0.97);
    var highCharts;
    var root;
    var autoRefresh = false;
    var _autoRefresh = true;
    var enabled = true;
    var autoNitroBtn = null;
    var disqualified = false;
    var lessonLoaded = false;
    var finished = false;
    var chartOn = false;
    var timeoutToggle = false;
    var inDip = false;
    var autoNitro = true;
    var info;
    var ws = null;
    var infoSpan;
    var injectedRoot;
    var fillsY = [];
    var points = [];
    var errorRequests = [];
    var lesson = "";
    var packetLesson = "";
    var opt;
    var optOn = false;
    var renderedKeys = 0;
    var i = 0;
    var chart;
    var g;
    var timeout = 0;
    var toggled = false;
    var firstDetected = false;
    var startTime = null;
    var endTime = null;
    var wordsPerMinute = gen(80, 105);
    var username = "";
    var avgSpeed = null;
    var acc = null;
    var wpm = null;
    var statsDiv = null;
    var statsOn = true;
    var userInfo = {};
    var statTogg = null;
    var Cookies;
    var index = 0;
    var nitrosUsed = 0;
    var loggedEndRace = false;
    var userBanned = false;
    var firstTurbo = false;
    var isStopped = false;
    var autoTurbo = getLocalStorage('autoTurbo');
    if (!autoTurbo) {
        autoTurbo = false;
    } else {
        autoTurbo = JSON.parse(autoTurbo);
    }

    // API events
    var apie = {
        onReady: null,
        onRaceFinish: null,
        onRaceStart: null,
        onNitroUsed: null,
        onUserBanned: null,
        onRaceStarting: null,
        onType: null
    }

    console.clear = function() {};
    var type = function(charCode) {
        index++;
        $(document.body).trigger({
            type: 'keypress',
            which: charCode
        });
    }
    var typePacket = function(isRight, idx) {
        var me = this;
        var packet = {
            stream: "race",
            msg: "update",
            payload: {  }
        };
        if (isRight) {
            packet.payload.t = idx;
        } else {
            packet.payload.e = idx;
        }
        ws.send("4" + JSON.stringify(packet));
    }
    var turbo = function() {
        debug("Turbo mode called. Sending " + (TURBO_PACKET_COUNT.toString()) + " type packets.");
        for (var i = 0; i < TURBO_PACKET_COUNT; ++i) {
            typePacket(true, TURBO_PACKET_IDX);
        }
    }
    var debug = function() {
        if (LOG_DEBUG) {
            arguments[0] && (arguments[0] = ("[UltraType] " + arguments[0]));
            console.log.apply(this, arguments);
        }
    }
    var tdebug = function() {
        if (LOG_TYPING_INFO) {
            arguments[0] && (arguments[0] = ("[UltraType] " + arguments[0]));
            console.log.apply(this, arguments);
        }
    }
    function flushOldCookies() {
        debug("Removing old cookies...");
        Cookies.remove('autoRefresh');
        Cookies.remove('accuracy');
        Cookies.remove('speedChange');
        Cookies.remove('statsOn');
        Cookies.remove('wpm');
        debug("Done removing cookies. Sorry you can't ban my users, Teaching.com.");
    }
    setTimeout(flushOldCookies, 3000);
    function useNitro() {
        if (apie.onNitroUsed) apie.onNitroUsed();
        setTimeout(function() {
            type(13);
            nitrosUsed++;
        }, 134);
    }
    function autoTurboOn() {
        autoTurbo = true;
        setLocalStorage('autoTurbo', autoTurbo);
    }
    function autoTurboOff() {
        autoTurbo = false;
        setLocalStorage('autoTurbo', autoTurbo);
    }
    function rm(id, isClass) {
        if (!isClass) {
            document.getElementById(id).remove();
        } else {
            var elms = document.getElementsByClassName(id);
            for (var i = 0; i < elms.length; ++i) {
                elms[i].remove();
            }
        }
    }
    function addGraph(g) {
        if (isStopped) return;
        if (root) {
            var _style = $("<style>.highcharts-container{width:100% !important;height:100% !important;display:inline-block;}</style>");
            root.appendChild(_style[0]);
            root.appendChild(g);
        } else if (document.body) {
            // Fallback
            var _style = $("<style>.highcharts-container{width:100% !important;height:100% !important;display:inline-block;}</style>");
            root.appendChild(_style[0]);
            document.body.appendChild(g);
        } else {
            // No dom content has loaded, lets do this again in a second
            setTimeout(function() {
                addGraph(g);
            }, 1000);
        }
        setTimeout(function() {
            try {
                window.dispatchEvent(new Event('resize'));
            } catch(e) {
                debug("WARN: Couldn't dispatch resize event:", e);
            }
        }, 500);
    }
    function getBotState() {
        // Stringifys the current state of the bot as a JSON object
        var state = {
            nitrosUsed: nitrosUsed,
            lesson: lesson,
            currWord: index,
            wpm: wordsPerMinute,
            acc: accuracy,
            errReqs: errorRequests.length,
            uinfo: JSON.stringify(userInfo),
            fillsY: fillsY.length,
            version: VERSION,
            wpmHistory: points,
            isFinished: finished,
            startTime: startTime,
            endTime: endTime
        };
        return JSON.stringify(state);
    }
    function transmitBan() {
        // Send ban info to the content script
        var state = getBotState();
        var msg = {
            from: 'UltraType',
            state: state
        }
        window.postMessage(msg, location.origin);
    }
    function showBan() {
        userBanned = true;
        /*
        debug("This account has been banned. Here is a bunch of debug information:");
        debug("nitrosUsed:", nitrosUsed);
        debug("lesson:", lesson);
        debug("index:", index);
        debug("wpm:", wordsPerMinute);
        debug("accuracy:", accuracy);
        debug("errorRequests length:", errorRequests.length);
        debug("userInfo", JSON.stringify(userInfo));
        debug("fillsY length", fillsY.length);
        debug("VERSION", VERSION);
        debug("WPM Points", points);
        debug("finished:", finished);
        debug("Start time:", startTime);
        debug("End time:", endTime);
        debug("Please report this to the UltraType developer.");
        document.documentElement.innerHTML = "";
        document.open();
        document.write("<h1>User has been banned. Check developer tools. (Control+ Shift + J)</h1>");
        document.close();
        */
        debug("Sending bot state to banInfo endpoint");
        transmitBan();
        if (apie.onUserBanned) {
            apie.onUserBanned();
        }
        return;
    }
    function checkIfBanned(callback) {
        if (userInfo.username) {
            debug("Attempting to get user's page");
            var xhr = new XMLHttpRequest();
            xhr.open("GET", "https://www.nitrotype.com/racer/" + encodeURIComponent(userInfo.username), true);
            xhr.send();
            xhr.onload = function() {
                var status = this.status;
                var res = this.responseText;
                if (status !== 200 || (res.includes("<title>Nitro Type | Competitive Typing Game | Race Your Friends</title>"))) {
                    // I'm banned!
                    showBan();
                } else {
                    // Everything normal
                    callback();
                }
            }
            // Errors aren't very nice
            xhr.onerror = showBan;
        } else debug("WARN: Can't check if my user is banned, the userInfo is not valid:", userInfo);
    }
    function updateStats() {
        if (userInfo.username) {
            statsDiv.innerHTML = "";
            statsDiv.style.color = "white";
            statsDiv.style.display = 'inline-block';

            var st = document.createElement('span');
            var sname = document.createElement('span');
            sname.textContent = userInfo.username;
            sname.style.color = 'red';

            st.textContent = "Stats for user ";
            st.appendChild(sname);
            statsDiv.appendChild(st);
            statsDiv.appendChild(document.createElement('br'));
            statsDiv.appendChild(document.createElement('br'));

            var statTitle = document.createElement('span');
            var stt = document.createElement('span');
            stt.textContent = userInfo.title;
            stt.style.color = 'blue';
            statTitle.textContent = "Title: ";
            statTitle.appendChild(stt);
            statsDiv.appendChild(statTitle);
            statsDiv.appendChild(document.createElement('br'));

            if (userInfo.tag !== '') {
                var statTeam = document.createElement('span');
                statTeam.textContent = 'Team: ';
                var sTeam = document.createElement('span');
                if (userInfo.tagColor) sTeam.style.color = userInfo.tagColor;
                sTeam.textContent = userInfo.tag;
                statTeam.appendChild(sTeam);
                statsDiv.appendChild(statTeam);
                statsDiv.appendChild(document.createElement('br'));
            }
            var statNitro = document.createElement('span');
            var sn = document.createElement('span');
            sn.textContent = userInfo.nitros;
            sn.style.color = 'blue';

            statNitro.textContent = "Total nitros: ";
            statNitro.appendChild(sn);
            statsDiv.appendChild(statNitro);
            statsDiv.appendChild(document.createElement('br'));

            var statMoney = document.createElement('span');
            var stm1 = document.createElement('span');
            stm1.textContent = "$" + userInfo.money + " (Spent: $" + userInfo.moneySpent + ")";
            stm1.style.color = 'blue';
            statMoney.textContent = 'Money: ';
            statMoney.appendChild(stm1);

            statsDiv.appendChild(statMoney);
            statsDiv.appendChild(document.createElement('br'));

            var statMember = document.createElement('span');
            var sm = document.createElement('span');
            sm.textContent = (userInfo.membership !== 'basic');
            sm.style.color = 'blue';

            statMember.textContent = 'Gold Membership: ';
            statMember.appendChild(sm);
            statsDiv.appendChild(statMember);
            statsDiv.appendChild(document.createElement('br'));

            var statRaces = document.createElement('span');
            var sr = document.createElement('span');
            sr.style.color = 'blue';
            sr.textContent = userInfo.racesPlayed;
            statRaces.textContent = 'Total races played: ';
            statRaces.appendChild(sr);
            statsDiv.appendChild(statRaces);
            statsDiv.appendChild(document.createElement('br'));

            var statWins = document.createElement('span');
            var sw = document.createElement('span');
            sw.textContent = userInfo.consecWins;
            sw.style.color = 'blue';
            statWins.textContent = 'Consecutive wins: ';
            statWins.appendChild(sw);
            statsDiv.appendChild(statWins);
            statsDiv.appendChild(document.createElement('br'));
        } else {
            setTimeout(updateStats, 1000);
        }
    }

    function disableStats() {
        statsDiv.innerHTML = "";
    }
    var __ = {};
    var _ = {
        fill: window.CanvasRenderingContext2D.prototype.fillText,
        toStr: window.Function.prototype.toString,
        get: window.Object.prototype.__lookupGetter__,
        listen: window.addEventListener,
        unlisten: window.removeEventListener,
        reload: window.location.reload,
        host: ShadowRoot.prototype.__lookupGetter__('host'),
        fp: Function.prototype,
        warn: console.warn,
        ws: window.WebSocket,
        xsend: window.XMLHttpRequest.prototype.send,
        xopen: window.XMLHttpRequest.prototype.open,
        oerr: null
    };
    function extractUserName() {
        var storage = new Object(localStorage);
        var key = null;
        for (var p in storage) {
            if (storage.hasOwnProperty(p)) {
                try {
                    key = JSON.parse(ROT47(storage[p]));
                } catch (e) {
                    key = null;
                    continue;
                }
                if (key["username"]) {
                    return key["username"];
                }
            }
        }
        return null;
    }
    function extractStats() {
        var storage = new Object(localStorage);
        var key = null;
        for (var p in storage) {
            if (storage.hasOwnProperty(p)) {
                try {
                    key = JSON.parse(ROT47(storage[p]));
                } catch (e) {
                    key = null;
                    continue;
                }
                if (key["username"]) {
                    return key;
                }
            }
        }
        return null;
    }

    function reqStats(uname, callback) {
        var x = new XMLHttpRequest();
        x.open("GET", "https://www.nitrotype.com/racer/" + uname, true);
        x.send();
        x.onload = function() {
            callback(x.responseText);
        }
    }

    function setWPM(w) {
        if (isStopped)return;
        wordsPerMinute = w;
        wpm.value = w;
        setLocalStorage('wpm', w);
    }

    function autoNitroOn() {
        autoNitroBtn.style.borderColor = "LimeGreen";
        autoNitroBtn.style.color = "LimeGreen";
        autoNitroBtn.innerHTML = "On";
        setLocalStorage('autoNitro', true);
        autoNitro = true;
    }

    function autoNitroOff() {
        autoNitroBtn.style.borderColor = "Red";
        autoNitroBtn.style.color = "Red";
        autoNitroBtn.innerHTML = "Off";
        setLocalStorage('autoNitro', false);
        autoNitro = false;
    }

    function getLocalStorage(key) {
        try {
            return localStorage[key];
        } catch (e) {
            return null;
        }
    }

    function setLocalStorage(key, value) {
        try {
            return localStorage[key] = value;
        } catch (e) {
            return null;
        }
    }
    function reverseString(str) {
        var a = str.split("");
        var rev = "";
        for (var i = a.length - 1; i >= 0; --i) {
            rev += a[i];
        }
        return rev;
    }

    function decryptLesson(lesson) {
        var reversed = ROT47(lesson);
        return reverseString(reversed);
    }
    var __ws = function(ip, protocol) {
        ws = new _.ws(ip, protocol);
        ws.addEventListener('message', function(msg) {
            // console.debug('recieved', msg.data);
            var validPacket = true;
            var packet = {};
            if (msg.data) {
                try {
                    packet = JSON.parse(msg.data.substring(1, msg.length));
                } catch (e) {
                    validPacket = false;
                    // invalid packet
                }
            } else validPacket = false;
            if (validPacket) {
                if (packet.msg == "error") {
                    respawn();
                } else if (packet.stream == "race") {
                    if (packet.msg == "status") {
                        if (packet.payload.status == "countdown" && packet.payload.l) {
                            var _lesson = packet.payload.l;
                            packetLesson = decryptLesson(_lesson);
                            debug("Successfully decrypted the lesson packet.");
                        }
                    }
                }
            }
        });
        return ws;
    }
    var _send = WebSocket.prototype.send;
    WebSocket.prototype.send = function() {
        return _send.apply(this, arguments);
    }

    function tgen(val) {
        max = val + 17;
        min = val - 17;
        var rand = 0;
        for (var i = 0; i < 6; i += 1) {
            rand += Math.random();
        }
        return Math.ceil((((rand - 3) / 3) * (max - min)) + min);
    }

    function FillTextEvent(args) {
        this.text = args[0];
        if (this.text.length < 2) {
            renderedKeys++;
            fillsY.push(args[2]);
            if (fillsY[fillsY.length - 1] < fillsY[fillsY.length - 2]) {
                lesson += " ";
            }
            lesson += this.text;
            if (renderedKeys > 128 && firstDetected == false) {
                firstDetected = true;
                lesson = this.text;
                setTimeout(function() {
                    lessonLoad();
                    apie.onRaceStarting && (apie.onRaceStarting());
                }, 200);
            }
        }
    }

    function gen(min, max) {
        return Math.floor(Math.random() * max) + min;
    }
    __.fill = function() {
        new FillTextEvent(arguments);
        _.fill.apply(this, arguments);
    }
    function randomBool(percentFalse) {
        var percent = 0.5;
        var ret = null;
        if (typeof percentFalse === "number") {
            percent = percentFalse;
        } else {
            debug("WARN: No percentage false specified for random boolean generation. Using 0.5.");
        }
        ret = Math.random() > percent;
        tdebug("Calculated random bool with false percentage", percent, "Result:", ret);
        return ret;
    }
    function isAccurate() {
        var acc = Math.random() < accuracy;
        tdebug("Calculated isAccurate", acc);
        return acc;
    }
    /*
        This is the core AI behind UltraType.
        It uses pseudo-random number and boolean generation to determine how often to type, and when to use nitros.
        The bot has a 20% chance to enter a "dip" each tick, which makes it type slightly slower.
    */
    function generateTypeDecision(offset) {
        if(isStopped)return;
        setTimeout(function() {
            var dipRate = 0.80;
            var WRONG = false;
            timeout = tgen(12000 / wordsPerMinute);
            if (inDip) {
                // Re adjust the timeout
                dipRate = 0.40;
                timeout = tgen(12000 / wordsPerMinute);
            }
            if (enabled) {
                if (!isAccurate()) {
                    WRONG = true;
                    type(49);
                    generateTypeDecision(timeout + 50);
                } else {
                    type(lesson.charCodeAt(i));
                }
                if (!WRONG) {
                    i++;
                    if (i < lesson.length) {
                        generateTypeDecision(timeout);
                    }
                }
                if (autoNitro) {
                    /*
                    if (lesson && index && ((lesson.length - (lesson.length / 3)) <= index)) {
                        if (loggedEndRace === false) {
                            debug("The race is coming to an end, I'm upping the chance of Nitro usage.");
                            loggedEndRace = true;
                        }
                        // We are near the end of the race, lets raise the chance of using a nitro by quite a large margin
                        if (randomBool(0.80)) {
                            debug("Using an end race nitro");
                            useNitro();
                        }
                    } else if (randomBool(0.999)) { // Theres a 0.1% chance that a nitro is used mid race during a tick
                        debug("Using a mid race nitro");
                        useNitro();
                    }
                    */
                    if (randomBool(0.999)) { // Theres a 0.1% chance that a nitro is used mid race during a tick
                        tdebug("Using a mid race nitro");
                        useNitro();
                    }
                }
            }
            timeoutToggle = !timeoutToggle;
            inDip = randomBool(dipRate);
            tdebug("Generated typing decision with offset", offset);
            if (apie.onType) {
                apie.onType({
                    charTyped: lesson.charCodeAt(i),
                    isWront: WRONG
                });
            }
        }, offset);
    }
    function lessonLoad() {
        debug("The prerendered lesson has been captured and loaded. Starting in " + (LOAD_TIME / 1000) + " seconds.");
        if (!isStopped) {
            infoSpan.innerHTML = "Starting...";
            infoSpan.style.color = "#00b300";
        }
        setTimeout(function() {
            if (!isStopped) infoSpan.innerHTML = "Started!";
            lessonLoaded = true;
            startTime = new Date();
            if (!isStopped) infoSpan.style.color = "#33ff33";
            if (lesson.length > 1) {
                generateTypeDecision();
                debug("Started the bot!");
                if (autoTurbo) {
                    setTimeout(function() {
                        debug("Using auto turbo");
                        turbo();
                    }, 750);
                }
            } else {
                debug("The lesson is malformed! Lesson:", ('"' + lesson + '"'));
                return;
            }
            if (apie.onRaceStart) {
                apie.onRaceStart(startTime, lesson);
            }
        }, LOAD_TIME);
    }
    console.warn = function() {
        if (arguments[0] == "You have been disqualified") {
            disqualified = true;
        }
        console.log.apply(this, arguments);
    }

    function respawn() {
        debug("respawn() called - refreshing in a few seconds.");
        if (/* autoRefresh */ _autoRefresh) {
            // Timeout so the player can view their race stats if they wish
            setTimeout(function() {
                _.reload.apply(window.location, []);
            }, gen(2000, 4000));
        }
    }
    function removeUITrash() {
        // Remove some garbage on the UI
        debug("Cleaning up the original UI...");
        try {
            rm('settings-button');
            rm('app-footer', 1);
            rm('tooltip-hover', 1);
        } catch (e) {
            debug("Issue removing UI trash", e);
        }
    }
    function onfinish(callback) {
        setInterval(function() {
            var deadDivs = document.getElementsByClassName('popup race-results');
            var banner = document.getElementsByClassName('banner');
            if ((deadDivs && deadDivs != [] && deadDivs.length !== 0 && deadDivs.toString() !== "") || (disqualified) || (banner && banner.length !== 0 && banner !== [])) {
                if (finished == false) {
                    finished = true;
                    callback();
                }
            }
        }, 100);
    }
    function createUI(body) {
        if (isStopped) {
            return;
        }
        toggled = false;
        var isDragging = false;
        var UIopacity = 0.7;
        var doc = document.querySelector('html');
        var inner = document.querySelector('.wrap');
        injectedRoot = document.createElement('div');
        body.appendChild(injectedRoot);
        root = injectedRoot.createShadowRoot();
        var UI = document.createElement('div');
        $(root).append(FONT);
        Object.defineProperty(UI, 'shadowRoot', {
            get: function() {
                return null;
            },
            enumerable: false
        });
        Object.defineProperty(injectedRoot, 'shadowRoot', {
            get: function() {
                return null;
            },
            enumerable: false
        });
        Object.defineProperty(root, 'shadowRoot', {
            get: function() {
                return null;
            },
            enumerable: false
        });
        UI.style.zIndex = 999999;
        UI.id = "botUI";
        UI.style.position = "fixed";
        UI.style.top = "3%";
        UI.style.left = "3%";
        UI.style.color = "white";
        UI.style.borderStyle = "solid";
        UI.style.borderColor = "#000066";
        UI.style.borderWidth = "6px";
        UI.style.borderRadius = "7px";
        UI.style.padding = "10px";
        UI.style.backgroundColor = "black";
        UI.style.textAlign = "center";
        UI.style.opacity = UIopacity;
        UI.style.transition = "opacity 1s, border 1s, border-color 1s";
        UI.style.fontFamily = "'Ubuntu', sans-serif";
        UI.onmouseover = function() {
            UIopacity = 1;
            UI.style.opacity = UIopacity;
        }
        UI.onmouseleave = function() {
            UIopacity = 0.7;
            UI.style.opacity = UIopacity;
        }

        var outerTitle = document.createElement('center');
        var title = document.createElement('p');
        title.style.fontSize = "135%";
        title.innerHTML = "<strong>UltraType 2</strong>";
        UI.style.fontSize = "135%";
        outerTitle.appendChild(title);
        UI.appendChild(outerTitle);

        var outerInfo = document.createElement('center');
        info = document.createElement('p');
        infoSpan = document.createElement('span');
        infoSpan.innerHTML = "Idle.";
        infoSpan.style.color = "#b3b3b3";
        infoSpan.style.transition = "color 2s";
        info.style.fontSize = "100%";
        info.innerHTML += "Status: ";
        info.appendChild(infoSpan);
        outerInfo.appendChild(info);
        UI.appendChild(outerInfo);

        var outerEnable = document.createElement('center');
        var enableButton = document.createElement('button');
        enableButton.className = "";
        enableButton.style.backgroundColor = "transparent";
        enableButton.style.border = "3px solid";
        enableButton.style.borderRadius = "3px";
        enableButton.style.fontSize = "125%";
        enableButton.style.borderColor = "#808080";
        enableButton.style.color = "#808080";
        enableButton.style.transition = "border 500ms, border-color 500ms, color 500ms";
        enableButton.innerHTML = "Customize";
        enableButton.onclick = function() {
            if (!optOn) {
                optOn = true;
                opt.style.opacity = 0.95;
                opt.style.pointerEvents = "all";
                opt.focus();
            } else {
                return;
            }
        }
        _.listen.apply(enableButton, ["mouseover", function() {
            enableButton.style.color = "white";
            enableButton.style.borderColor = "white";
        }, true]);
        _.listen.apply(enableButton, ["mouseout", function() {
            enableButton.style.color = "#808080";
            enableButton.style.borderColor = "#808080";
        }, true]);
        outerEnable.appendChild(enableButton);
        UI.appendChild(outerEnable);

        var outerTurbo = document.createElement('center');
        var turboBtn = document.createElement('button');
        turboBtn.className = "";
        turboBtn.style.backgroundColor = "transparent";
        turboBtn.style.border = "3px solid";
        turboBtn.style.borderRadius = "3px";
        turboBtn.style.fontSize = "125%";
        turboBtn.style.borderColor = "#ff1a1a";
        turboBtn.style.color = "#ff1a1a";
        turboBtn.style.transition = "border 500ms, border-color 500ms, color 500ms";
        turboBtn.innerHTML = "Turbo";
        turboBtn.onclick = function() {
            turboBtn.style.color = "#660000";
            turboBtn.style.borderColor = "#660000";
            if (!firstTurbo) {
                firstTurbo = true;
                if (localStorage["turboAlert"]) {
                    try {
                        turbo();
                    } catch(e) {
                        debug("WARN: Couldn't turbo", e);
                    };
                } else {
                    alert("WARNING: Abuse of turbo mode may get you banned!\nThis message will not be displayed again.");
                    localStorage["turboAlert"] = 1;
                    try {
                        turbo();
                    } catch(e) {
                        debug("WARN: Couldn't turbo", e);
                    };
                }
            }
        }
        UI.appendChild(document.createElement('br'));
        outerTurbo.appendChild(turboBtn);
        UI.appendChild(outerTurbo);

        var discordMsg = document.createElement('p');
        discordMsg.innerHTML = "<a href='https://discord.gg/NkhuDZS'>Join our Discord!</a>";
        UI.appendChild(discordMsg);

        UI.appendChild(document.createElement('br'));
        statsDiv = document.createElement('center');
        statsDiv.innerHTML = 'Stats are loading...';
        statsDiv.style.color = 'grey';
        statsDiv.style.display = 'none';
        UI.appendChild(statsDiv);
        UI.appendChild(document.createElement('br'));

        function moveUI(e) {
            UI.style.top = (e.clientY - (e.clientY - UI.style.top)) + 'px';
            UI.style.left = (e.clientX - (e.clientX - UI.style.left)) + 'px';
        }
        _.listen.apply(window, ['keydown', function(e) {
            if (e.keyCode == 27) {
                toggled = !toggled;
                if (toggled) {
                    UI.style.opacity = 0;
                    g.style.opacity = 0;
                    UI.style.pointerEvents = "none";
                    g.style.pointerEvents = "none";
                } else {
                    UI.style.opacity = UIopacity;
                    if (chartOn) g.style.opacity = UIopacity;
                    UI.style.pointerEvents = "auto";
                    if (chartOn) g.style.pointerEvents = "auto";
                    else g.style.pointerEvents = "none";
                }
            }
        }]);
        _.listen.apply(window, ['mouseup', function(e) {
            isDragging = false;
            UI.style.opacity = UIopacity;
            UI.style.borderColor = "#000066";
            e.preventDefault();
            _.unlisten.apply(window, ['mousemove', moveUI, true]);
        }, false]);
        root.appendChild(UI);
        detectWebGL();
        createOptsMenu();
        if (apie.onReady) {
            apie.onReady();
        }
    }

    function initGraph() {
        g = document.createElement('div');
        g.style.zIndex = 9999;
        g.style.backgroundColor = "#000";
        g.style.fontFamily = "Ubuntu";
        g.style.position = "fixed";
        g.style.bottom = "5%";
        g.style.right = "5%";
        g.style.fontSize = "125%";
        g.style.color = "white";
        g.style.opacity = 0.7;
        g.style.padding = "10px";
        g.style.border = "6px solid";
        g.style.borderColor = "#000066";
        g.style.borderRadius = "7px";
        g.style.width = "40%";
        g.style.height = "25%";
        g.style.transition = "opacity 1s, border 1s, border-color 1s";
        Highcharts.chart(g, {
            chart: {
                backgroundColor: {
                    linearGradient: [0, 0, 500, 500],
                    stops: [
                        [0, 'rgb(0, 0, 0)'],
                        [1, 'rgb(0, 0, 0)']
                    ]
                },
                style: {
                    color: "#fff",
                    fontFamily: "Ubuntu"
                }
            },
            title: {
                text: "Speed",
                x: -20,
                style: {
                    color: "#fff",
                    fontFamily: "Ubuntu"
                }
            },
            tooltip: {
                valueSuffix: ' WPM',
            },
            xAxis: {
                gridLineWidth: 0,
                categories: [
                    //
                ],
                labels: {
                    style: {
                        color: '#FFF',
                        font: 'Ubuntu'
                    }
                }
            },
            yAxis: {
                gridLineWidth: 0,
                title: {
                    text: "WPM"
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#ff0000'
                }],
                labels: {
                    style: {
                        color: '#FFF',
                        font: 'Ubuntu'
                    }
                }
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle',
                borderWidth: 0,
                style: {
                    color: "#fff"
                }
            },
            plotOptions: {
                line: {
                    marker: {
                        enabled: false
                    }
                }
            },
            series: [{
                name: 'Speed in WPM',
                data: points,
                color: '#000066'
            }]
        });
        chart = Highcharts.charts[0];
        _.listen.apply(g, ['mouseover', function() {
            if (chartOn) g.style.opacity = 1;
            if (chartOn) g.style.borderColor = "#0000ff";
        }, true]);
        _.listen.apply(g, ['mouseout', function() {
            if (chartOn) g.style.opacity = 0.7;
            if (chartOn) g.style.borderColor = "#000066";
        }, true]);
        addGraph(g);
        setTimeout(function() {
            var cr = g.getElementsByClassName('highcharts-credits');
            for (var i = 0; i < cr.length; i++) {
                cr[i].remove();
            }
        }, 500);
    }

    function createOptsMenu() {
        opt = document.createElement('div');
        opt.style.zIndex = 99999999;
        opt.style.backgroundColor = "#000";
        opt.style.border = "6px solid";
        opt.style.borderColor = "#000066";
        opt.style.borderRadius = "6px";
        opt.style.fontSize = "150%";
        opt.style.color = "#FFF";
        opt.style.position = "fixed";
        opt.style.padding = "10px";
        opt.style.top = "50%";
        opt.style.left = "50%";
        opt.style.width = "40%";
        opt.style.fontFamily = "Ubuntu";
        opt.style.height = "60%";
        opt.style.transform = "translate(-50%, -50%)";
        opt.style.transition = "opacity 1s, border 1s, border-color 1s";

        opt.style.opacity = 0;
        opt.style.pointerEvents = "none";

        var inner = document.createElement('center');

        var lbl = document.createElement('h1');
        lbl.style.fontSize = "150%";
        lbl.innerHTML = "Customize UltraType";
        inner.appendChild(lbl);

        var outerBotOn = document.createElement('div');
        var botOnBtn = document.createElement('button');
        botOnBtn.className = "";
        botOnBtn.style.backgroundColor = "transparent";
        botOnBtn.style.border = "3px solid";
        botOnBtn.style.borderRadius = "3px";
        botOnBtn.style.fontSize = "100%";
        botOnBtn.style.borderColor = "LimeGreen";
        botOnBtn.style.color = "LimeGreen";
        botOnBtn.style.transition = "border 2s, border-color 2s, color 2s";
        botOnBtn.innerHTML = "On";
        botOnBtn.onclick = function() {
            enabled = !enabled;
            if (!enabled) {
                botOnBtn.style.borderColor = "red";
                botOnBtn.style.color = "red";
                botOnBtn.innerHTML = "Off";
            } else {
                botOnBtn.style.borderColor = "LimeGreen";
                botOnBtn.style.color = "LimeGreen";
                botOnBtn.innerHTML = "On";
            }
        }
        outerBotOn.innerHTML += "Bot enabled: ";
        outerBotOn.appendChild(botOnBtn);
        inner.appendChild(outerBotOn);

        var outerToggle = document.createElement('div');
        var toggleButton = document.createElement('button');
        toggleButton.className = "";
        toggleButton.style.backgroundColor = "transparent";
        toggleButton.style.border = "3px solid";
        toggleButton.style.borderRadius = "3px";
        toggleButton.style.fontSize = "100%";
        toggleButton.style.borderColor = "LimeGreen";
        toggleButton.style.color = "LimeGreen";
        toggleButton.style.transition = "border 2s, border-color 2s, color 2s";
        toggleButton.innerHTML = "On";
        toggleButton.onclick = function() {
            autoRefresh = !autoRefresh;
            setLocalStorage('autoRefresh', autoRefresh);
            if (!autoRefresh) {
                toggleButton.style.borderColor = "red";
                toggleButton.style.color = "red";
                toggleButton.innerHTML = "Off";
            } else {
                toggleButton.style.borderColor = "LimeGreen";
                toggleButton.style.color = "LimeGreen";
                toggleButton.innerHTML = "On";
            }
        }
        outerToggle.innerHTML += "Auto Refresh: ";
        outerToggle.appendChild(toggleButton);
        inner.appendChild(outerToggle);

        var outerNtr = document.createElement('div');
        autoNitroBtn = document.createElement('button');
        autoNitroBtn.className = "";
        autoNitroBtn.style.backgroundColor = "transparent";
        autoNitroBtn.style.border = "3px solid";
        autoNitroBtn.style.borderRadius = "3px";
        autoNitroBtn.style.fontSize = "100%";
        autoNitroBtn.style.borderColor = "LimeGreen";
        autoNitroBtn.style.color = "LimeGreen";
        autoNitroBtn.style.transition = "border 2s, border-color 2s, color 2s";
        autoNitroBtn.innerHTML = "On";
        autoNitroBtn.onclick = function() {
            if (autoNitro) {
                autoNitroOff();
            } else {
                autoNitroOn();
            }
        }

        outerNtr.innerHTML += "Auto Nitro: ";
        outerNtr.appendChild(autoNitroBtn);
        inner.appendChild(outerNtr);

        var exitButton = document.createElement('button');
        exitButton.className = "";
        exitButton.style.position = "absolute";
        exitButton.style.bottom = "3%";
        exitButton.style.left = "50%";
        exitButton.style.borderColor = "#808080";
        exitButton.style.color = "#808080";
        exitButton.style.transform = "translate(-50%, 3%)";
        exitButton.style.fontSize = "175%";
        exitButton.style.border = "3px solid";
        exitButton.style.borderRadius = "3px";
        exitButton.style.backgroundColor = "transparent";
        exitButton.style.transition = "border 500ms, border-color 500ms, color 500ms";
        _.listen.apply(exitButton, ["mouseover", function() {
            exitButton.style.color = "#FFF";
            exitButton.style.borderColor = "#FFF";
        }, true]);
        _.listen.apply(exitButton, ["mouseout", function() {
            exitButton.style.color = "#808080";
            exitButton.style.borderColor = "#808080";
        }, true]);
        exitButton.innerHTML = "Exit";
        exitButton.onclick = function() {
            opt.style.opacity = 0;
            opt.style.pointerEvents = "none";
            optOn = false;
            opt.blur();
        }
        inner.appendChild(exitButton);

        var outerChrtBtn = document.createElement('div');
        var chartBtn = document.createElement('button');
        chartBtn.className = "";
        chartBtn.style.backgroundColor = "transparent";
        chartBtn.style.border = "3px solid";
        chartBtn.style.borderRadius = "3px";
        chartBtn.style.fontSize = "100%";
        chartBtn.style.borderColor = "LimeGreen";
        chartBtn.style.color = "LimeGreen";
        chartBtn.style.transition = "border 2s, border-color 2s, color 2s";
        chartBtn.innerHTML = "On";
        chartBtn.onclick = function() {
            chartOn = !chartOn;
            setLocalStorage('chartOn', chartOn);
            if (!chartOn) {
                chartBtn.style.borderColor = "red";
                chartBtn.style.color = "red";
                chartBtn.innerHTML = "Off";
                g.style.opacity = 0;
            } else {
                chartBtn.style.borderColor = "LimeGreen";
                chartBtn.style.color = "LimeGreen";
                chartBtn.innerHTML = "On";
                g.style.opacity = 0.7;
            }
        }
        outerChrtBtn.innerHTML += "Speed chart: ";
        outerChrtBtn.appendChild(chartBtn);
        inner.appendChild(outerChrtBtn);

        var outerACfg = document.createElement('div');
        acc = document.createElement('input');
        acc.type = "number";
        acc.min = 10;
        acc.max = 100;
        acc.value = accuracy * 100;
        acc.className = "";
        acc.style.backgroundColor = "transparent";
        acc.style.border = "3px solid";
        acc.style.borderRadius = "3px";
        acc.style.fontSize = "100%";
        acc.style.borderColor = "LimeGreen";
        acc.style.color = "LimeGreen";
        acc.style.transition = "border 2s, border-color 2s, color 2s";
        acc.onchange = function() {
            accuracy = parseInt(acc.value);
            if (isNaN(accuracy)) {
                accuracy = 0.98;
                acc.value = 98;
            } else {
                accuracy *= 0.01;
            }
            setLocalStorage('accuracy', accuracy);
        }

        outerACfg.innerHTML += "Accuracy %: ";
        outerACfg.appendChild(acc);
        inner.appendChild(outerACfg);

        var oWPMCfg = document.createElement('div');
        wpm = document.createElement('input');
        wpm.type = "number";
        wpm.min = 3;
        wpm.max = 220; // About the fastest you can go without any bans
        wpm.value = wordsPerMinute;
        wpm.className = "";
        wpm.style.backgroundColor = "transparent";
        wpm.style.border = "3px solid";
        wpm.style.borderRadius = "3px";
        wpm.style.fontSize = "100%";
        wpm.style.borderColor = "LimeGreen";
        wpm.style.color = "LimeGreen";
        wpm.style.transition = "border 2s, border-color 2s, color 2s";
        wpm.onchange = function() {
            if (getLocalStorage("speedChange") != null) {
                wordsPerMinute = parseInt(wpm.value);
                if (isNaN(wordsPerMinute))
                    wpm.value = 85;
                wordsPerMinute = (wpm.value);
                setLocalStorage('wpm', wordsPerMinute);
            } else {
                alert('It is not recommended to alter the default speed of UltraType, be careful! This message will not be shown again.');
                setLocalStorage('speedChange', true);
            }
        }

        oWPMCfg.innerHTML += "WPM: ";
        oWPMCfg.appendChild(wpm);
        inner.appendChild(oWPMCfg);

        var outerStatTogg = document.createElement('div');
        statTogg = document.createElement('button');

        statTogg.className = "";
        statTogg.style.backgroundColor = "transparent";
        statTogg.style.border = "3px solid";
        statTogg.style.borderRadius = "3px";
        statTogg.style.fontSize = "100%";
        statTogg.style.borderColor = "LimeGreen";
        statTogg.style.color = "LimeGreen";
        statTogg.style.transition = "border 2s, border-color 2s, color 2s";
        statTogg.innerHTML = "On";
        statTogg.onclick = function() {
            statsOn = !statsOn;
            if (statsOn) {
                statTogg.style.borderColor = "LimeGreen";
                statTogg.style.color = "LimeGreen";
                statTogg.innerHTML = "On";
                updateStats();
            } else {
                statTogg.style.borderColor = "red";
                statTogg.style.color = "red";
                statTogg.innerHTML = "Off";
                disableStats();
            }
            setLocalStorage('statsOn', statsOn);
        }
        outerStatTogg.innerHTML = "User Stats: ";
        outerStatTogg.appendChild(statTogg);
        inner.appendChild(outerStatTogg);

        var outerAutoT = document.createElement('div');
        var autoT = document.createElement('button');
        autoT.className = "";
        autoT.style.backgroundColor = "transparent";
        autoT.style.border = "3px solid";
        autoT.style.borderRadius = "3px";
        autoT.style.fontSize = "100%";
        autoT.style.borderColor = "LimeGreen";
        autoT.style.color = "LimeGreen";
        autoT.style.transition = "border 2s, border-color 2s, color 2s";
        autoT.innerHTML = "On";
        autoT.onclick = function() {
            if (!autoTurbo) {
                autoT.style.borderColor = "LimeGreen";
                autoT.style.color = "LimeGreen";
                autoT.innerHTML = "On";
                autoTurboOn();
            } else {
                autoT.style.borderColor = "red";
                autoT.style.color = "red";
                autoT.innerHTML = "Off";
                autoTurboOff();
            }
        }
        // Set the default button state
        if (autoTurbo) {
            autoT.style.borderColor = "LimeGreen";
            autoT.style.color = "LimeGreen";
            autoT.innerHTML = "On";
        } else {
            autoT.style.borderColor = "red";
            autoT.style.color = "red";
            autoT.innerHTML = "Off";
        }
        outerAutoT.innerHTML = "Auto Turbo: ";
        outerAutoT.appendChild(autoT);
        inner.appendChild(outerAutoT);

        var tips = document.createElement('p');
        tips.innerHTML = "Press escape to hide all of the UltraType menus.<br><a href='https://discord.gg/NkhuDZS'>Join our Discord!</a>";
        inner.appendChild(tips);

        opt.appendChild(inner);
        root.appendChild(opt);

        setTimeout(function() {
            var localChartOn = getLocalStorage('chartOn');
            var localAutoRefresh = getLocalStorage('autoRefresh');
            var localAccuracy = getLocalStorage('accuracy');
            var localWPM = getLocalStorage('wpm');
            var localAutoNitro = getLocalStorage('autoNitro');
            if (localAutoNitro !== null && localAutoNitro !== undefined) {
                localAutoNitro = JSON.parse(localAutoNitro);
                if (localAutoNitro == false) {
                    autoNitroOff();
                } else {
                    autoNitroOn();
                }
            }

            if (localAutoRefresh) {
                autoRefresh = JSON.parse(localAutoRefresh);
                if (!autoRefresh) {
                    toggleButton.style.borderColor = "red";
                    toggleButton.style.color = "red";
                    toggleButton.innerHTML = "Off";
                } else {
                    toggleButton.style.borderColor = "LimeGreen";
                    toggleButton.style.color = "LimeGreen";
                    toggleButton.innerHTML = "On";
                }
            }
            if (localChartOn) {
                chartOn = JSON.parse(localChartOn);
                if (!chartOn) {
                    chartBtn.style.borderColor = "red";
                    chartBtn.style.color = "red";
                    chartBtn.innerHTML = "Off";
                    g.style.opacity = 0;
                    g.style.pointerEvents = 'none';
                } else {
                    chartBtn.style.borderColor = "LimeGreen";
                    chartBtn.style.color = "LimeGreen";
                    chartBtn.innerHTML = "On";
                    g.style.opacity = 0.7;
                    g.style.pointerEvents = 'auto';
                }
            }
            if (localAccuracy) {
                accuracy = parseFloat(localAccuracy);
                acc.value = accuracy * 100;
            }
            if (localWPM) {
                wpm.value = localWPM;
                wordsPerMinute = parseInt(localWPM);
            }
            if (statsOn) {
                statTogg.style.borderColor = "LimeGreen";
                statTogg.style.color = "LimeGreen";
                statTogg.innerHTML = "On";
                updateStats();
            } else {
                statTogg.style.borderColor = "red";
                statTogg.style.color = "red";
                statTogg.innerHTML = "Off";
                disableStats();
            }
        }, 1000);
    }

    function blockAd(ad) {
        try {
            ad.style.display = "none";
        } catch (e) {
            ad.src = "about:blank";
        }
        try {
            ad.parentElement.parentElement.parentElement.remove();
        } catch (e) {};
    }

    function changeTip(node) {
        setTimeout(function() {
            node.style.fontSize = "125%";
            node.style.border = "3px solid #000066";
            node.style.borderRadius = "7px";
            node.style.opacity = 0.7;
            node.style.pointerEvents = "none";
            node.innerHTML = "";
            node.innerHTML += FONT;
            node.innerHTML += '<center style="font-family:Ubuntu;">UltraType - NitroType simplified.<br>Version: ' + VERSION + '</center>';
        }, 1000);
    }

    function detectWebGL() {
        if (document.cookie.includes('webgl')) {
            document.cookie = document.cookie.replace('webgl', 'canvas');
        }
    }
    var _set = null;

    function handleScript(scr) {
        if (scr.src.includes('race-lib')) {
            scr.addEventListener('load', function() {
                _set = PIXI.BitmapText.prototype.setText;
                var tos = __.toStr;
                PIXI.BitmapText.prototype.setText = function() {
                    var txt = arguments[0];
                    if (lessonLoaded) {
                        var t = parseInt(txt);
                        if ((t !== 0) && (t > 5)) {
                            points.push(t);
                            chart.series[0].setData(points, true);
                        }
                    }
                    _set.apply(this, arguments);
                }
            });
        }
    }
    onfinish(function() {
        debug("Race has finished. Doing a ban check and reloading if needed.");
        if (apie.onRaceFinish) {
            apie.onRaceFinish();
        }
        endTime = new Date();
        infoSpan.innerHTML = "Finished";
        infoSpan.style.color = "#b3b3b3";
        if (DO_BAN_CHECK) {
            debug('Doing ban check...');
            checkIfBanned(function() {
                debug("Ban check done. My user is not banned!");
                if (autoRefresh) {
                    respawn();
                }
            });
        } else if (autoRefresh) {
            debug("Auto refresh is enabled");
            respawn();
        } else {
            debug("Auto refresh is disabled");
        }
    });
    XMLHttpRequest.prototype.send = function() {
        return _.xsend.apply(this, arguments);
    }
    XMLHttpRequest.prototype.open = function() {
        if (arguments[1].includes('/api/error')) {
            errorRequests.push(this);
            this.abort();
            return;
        } else if (arguments[1].includes('problem-keys')) {
            debug("Aborting problem-keys AJAX request.");
            this.abort();
            return;
        }
        return _.xopen.apply(this, arguments);
    }
    // inject undetectable features
    window.PIXI = {};
    PIXI.BitmapText = function() {};
    PIXI.BitmapText.prototype.setText = function(a) {
        this.text = a || " ", this.dirty = !0
    };
    var hostt = ShadowRoot.prototype.__lookupGetter__('host');
    var _getToStr = Function.prototype.__lookupGetter__('toString');
    var _setTxt = Element.prototype.__lookupSetter__('textContent');
    var _getTitle = Document.prototype.__lookupGetter__('title');
    var _setTitle = Document.prototype.__lookupSetter__('title');
    CanvasRenderingContext2D.prototype.fillText = __.fill;
    window.WebSocket = __ws;
    var _get = _get;
    Function.prototype.toString = __.toStr = function() {
        if (this === Function.prototype.toString) return _.toStr.call(_.toStr);
        if (this === CanvasRenderingContext2D.prototype.fillText) return _.toStr.call(_.fill);
        if (this === Object.prototype.__lookupGetter__) return _.toStr.call(_.get);
        if (this === ShadowRoot.prototype.__lookupGetter__('host')) return _.toStr.call(hostt);
        if (this === Function.prototype.__lookupGetter__('toString')) return _.toStr.call(_getToStr);
        if (this === Element.prototype.__lookupSetter__('textContent')) return _.toStr.call(_setTxt);
        if (this === Document.prototype.__lookupGetter__('title')) return _.toStr.call(_getTitle);
        if (this === Document.prototype.__lookupSetter__('title')) return _.toStr.call(_setTitle);
        if (this === PIXI.BitmapText.prototype.setText) return _.toStr.call(_get);
        if (this === console.warn) return _.toStr.call(_.warn);
        if (this === WebSocket) return _.toStr.call(_.ws);
        if (this === XMLHttpRequest.prototype.send) return _.toStr.call(_.xsend);
        if (this === XMLHttpRequest.prototype.open) return _.toStr.call(_.xopen);
        if (this === window.onerror) return _.toStr.call(_.oerr);
        return _.toStr.call(this);
    }
    ShadowRoot.prototype.__defineGetter__('host', function() {
        if (this === injectedRoot) return null;
        return _.host.call(this);
    });
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type == "childList" && mutation.addedNodes.length > 0) {
                for (var i in mutation.addedNodes) {
                    if (mutation.addedNodes[i].nodeName == "BODY") createUI(mutation.addedNodes[i]);
                    if (mutation.addedNodes[i].nodeName == "IFRAME") blockAd(mutation.addedNodes[i]);
                    if (mutation.addedNodes[i].className == "race-tip") changeTip(mutation.addedNodes[i]);
                    if (mutation.addedNodes[i].nodeName == "SCRIPT") handleScript(mutation.addedNodes[i]);
                }
            }
        });
    });
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style']
    });
    var _fakeToStr = __.toStr;
    _fakeToStr.__proto__ = _.toStr.prototype;
    _fakeToStr.prototype = _.toStr.prototype;
    Object.defineProperty(Function.prototype, 'toString', {
        get: function() {
            if (this === __.toStr) return _fakeToStr;
            return __.toStr;
        },
        enumerable: false
    });
    Function.prototype.__defineGetter__('toString', function() {
        if (this === CanvasRenderingContext2D.prototype || this === CanvasRenderingContext2D.prototype.fillText) return __.toStr;
        if (this === console || this === console.warn) return __.toStr;
        if (this === ShadowRoot.prototype.__lookupGetter__('host') || this === ShadowRoot.prototype) return __.toStr;
        if (this === Object.prototype || this === Object.prototype.__lookupGetter__) return __.toStr;
        if (this === Function.prototype.__lookupGetter__('toString')) return __.toStr;
        if (this === PIXI.BitmapText.prototype.setText) return __.toStr;
        if (this === WebSocket) return __.toStr;
        if (this === injectedRoot) return __.toStr;
        if (this === Document.prototype.__lookupGetter__('title')) return __.toStr;
        if (this === Document.prototype.__lookupSetter__('title')) return __.toStr;
        if (this === XMLHttpRequest.prototype.send) return __.toStr;
        if (this === XMLHttpRequest.prototype.open) return __.toStr;
        if (this === window.onerror) return __.toStr;
        return _.toStr;
    });
    setInterval(function() {
        _setTitle.call(document, "UltraType 2");
    }, 100);
    Document.prototype.__defineGetter__('title', function(t) {
        return _title;
    });
    Document.prototype.__defineSetter__('title', function(t) {
        _title = t;
    });
    _.listen.apply(window, ['load', function() {
        _.oerr = window.onerror;
        window.onerror = function(evt) {
            if (evt.includes("'visible' of undefined")) {
                // Exception triggered due to turbo mode
                respawn();
            }
            return null;
        };
        window.onbeforeunload = function() {
            return null;
        };
        window.ga = function() {};

        username = extractUserName();
        userInfo = ROT47(localStorage["A=2J6C"]);
        userInfo = JSON.parse(userInfo);
        debug("Extracted and decrypted user info", userInfo);
        statsOn = getLocalStorage('statsOn');
        if (statsOn) {
            statsOn = JSON.parse(statsOn);
        }
        if (username) {
            if (!userInfo.avgSpeed) {
                debug("The user doesnt have an average speed.");
            } else {
                avgSpeed = userInfo.avgSpeed;
                if (avgSpeed > 15) {
                    // Randomize the player's WPM to prevent rapid scaling or downscaling of it
                    var addToWPM = randomBool(0.3);
                    var speedChange = gen(1, 5);
                    if (addToWPM) {
                        avgSpeed += speedChange;
                        debug("Added WPM of speed:", speedChange);
                    } else {
                        avgSpeed -= speedChange;
                        debug("Removed WPM of speed:", speedChange);
                    }
                    // 15 is the lowest speed
                    if (avgSpeed < 15) {
                        avgSpeed = gen(13, 17);
                    }
                    var l = getLocalStorage("speedChange");
                    if (!l) {
                        setWPM(avgSpeed);
                        debug("Set bot WPM to", avgSpeed);
                    } else {
                        debug("speedChange is set, not updating average speed.");
                    }
                }
            }
        }
        /*
        if (username) {
            reqStats(username, function(res) {
                var _html = document.createElement("html");
                _html.innerHTML = res;
                var scripts = _html.getElementsByTagName('script');
                var globalScript = null;
                for (var i = 0; i < scripts.length; ++i) {
                    if (scripts[i].innerHTML.includes('NTGLOBALS')) {
                        globalScript = scripts[i];
                    }
                }
                var r = new RegExp(/RACER_INFO: (.*)("racingStats":\[\]\},|(?:"prevRank":)(?:.*)\}\]\}\,)/);
                var ex = r.exec(globalScript.innerHTML);
                if (ex) {
                    ex = ex[0].split('RACER_INFO: ')[1];
                    ex = ex.substring(0, ex.length - 1);
                    try {
                        ex = JSON.parse(ex);
                    } catch (e) {
                        return;
                    }
                    avgSpeed = ex["avgSpeed"];
                    if (avgSpeed > 15) {
                        var l = getLocalStorage("speedChange");
                        if (!l) {
                            setWPM(avgSpeed);
                        }
                    }
                }
            });
        }
        */
    }]);
    window.addEventListener('DOMContentLoaded', function() {
        setTimeout(removeUITrash, 75);
    });
    var registerAPIEvent = function(evt, callback) {
        if (typeof callback !== 'function') {
            throw new Error('Invalid event callback.');
            return;
        }
        switch (evt) {
            case "userBanned":
                apie.onUserBanned = callback;
                break;
            case "raceStart":
                apie.onRaceStart = callback;
                break;
            case "raceEnd":
            case "raceFinish":
                apie.onRaceFinish = callback;
                break;
            case "nitroUsed":
            case "nitroUse":
            case "nitro":
                apie.onNitroUsed = callback;
                break;
            case "raceStarting":
            case "raceBegin":
            case "raceInit":
                apie.onRaceStarting = callback;
                break;
            case "type":
            case "typed":
            case "botType":
                apie.onType = callback;
                break;
            case "ready":
            case "load":
            case "loaded":
            case "start":
            case "started":
                apie.onReady = callback;
                break;
            default:
                throw new Error('Invalid event name!');
                break;
        }
        return window.UltraTypeCore;
    }
    // Core API
    var core = {
        on: registerAPIEvent,
        turbo: turbo,
        setWPM: setWPM,
        sendTypePacket: typePacket,
        typeChar: type,
        stopFromRunning: function() { // Stops the bot from appearing or typing
            isStopped = true;
        },
        getDecyptedUserInfo: function() {
            if (userInfo) {
                return userInfo;
            } else {
                return null;
            }
        },
        setAutoTurbo: function(state) {
            if (state === false) {
                autoTurboOff();
            } else if (state === true) {
                autoTurboOn();
            } else {
                throw new Error('Invalid auto turbo state.');
            }
        },
        getBotStateRaw: getBotState,
        getBotState: function() {
            var state = {
                nitrosUsed: nitrosUsed,
                lesson: lesson,
                currWord: index,
                wpm: wordsPerMinute,
                acc: accuracy,
                errReqs: errorRequests.length,
                uinfo: JSON.stringify(userInfo),
                fillsY: fillsY.length,
                version: VERSION,
                wpmHistory: points,
                isFinished: finished,
                startTime: startTime,
                endTime: endTime
            };
            return state;
        },
        toggleDebug: function() {
            LOG_DEBUG = !LOG_DEBUG;
        },
        getLesson: function() {
            if (lesson) {
                return lesson;
            } else return null;
        },
        setAutoRefresh: function(val) {
            if (typeof val !== 'boolean') {
                throw new Error('Can only set auto refresh to a boolean.');
                return;
            } else {
                autoRefresh = val;
            }
        },
        getNitrosUsed: function() { return nitrosUsed || 0 },
        toggleBotLog: function() {
            LOG_TYPING_INFO = !LOG_TYPING_INFO;
        },
        disableStats: disableStats,
        randBool: randomBool,
        updateStats: updateStats,
        useNitro: useNitro
    }
    window.UltraTypeCore = core;
    /*
     * JavaScript Cookie v2.1.3
     * https://github.com/js-cookie/js-cookie
     *
     * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
     * Released under the MIT license
     */
    ;
    (function(factory) {
        var OldCookies = Cookies;
        var api = Cookies = factory();
        api.noConflict = function() {
            Cookies = OldCookies;
            return api;
        };
    }(function() {
        function extend() {
            var i = 0;
            var result = {};
            for (; i < arguments.length; i++) {
                var attributes = arguments[i];
                for (var key in attributes) {
                    result[key] = attributes[key];
                }
            }
            return result;
        }

        function init(converter) {
            function api(key, value, attributes) {
                var result;
                if (typeof document === 'undefined') {
                    return;
                }
                if (arguments.length > 1) {
                    attributes = extend({
                        path: '/'
                    }, api.defaults, attributes);

                    if (typeof attributes.expires === 'number') {
                        var expires = new Date();
                        expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 864e+5);
                        attributes.expires = expires;
                    }

                    // We're using "expires" because "max-age" is not supported by IE
                    attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

                    try {
                        result = JSON.stringify(value);
                        if (/^[\{\[]/.test(result)) {
                            value = result;
                        }
                    } catch (e) {}

                    if (!converter.write) {
                        value = encodeURIComponent(String(value))
                            .replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
                    } else {
                        value = converter.write(value, key);
                    }

                    key = encodeURIComponent(String(key));
                    key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
                    key = key.replace(/[\(\)]/g, escape);

                    var stringifiedAttributes = '';

                    for (var attributeName in attributes) {
                        if (!attributes[attributeName]) {
                            continue;
                        }
                        stringifiedAttributes += '; ' + attributeName;
                        if (attributes[attributeName] === true) {
                            continue;
                        }
                        stringifiedAttributes += '=' + attributes[attributeName];
                    }
                    return (document.cookie = key + '=' + value + stringifiedAttributes);
                }
                if (!key) {
                    result = {};
                }

                // To prevent the for loop in the first place assign an empty array
                // in case there are no cookies at all. Also prevents odd result when
                // calling "get()"
                var cookies = document.cookie ? document.cookie.split('; ') : [];
                var rdecode = /(%[0-9A-Z]{2})+/g;
                var i = 0;

                for (; i < cookies.length; i++) {
                    var parts = cookies[i].split('=');
                    var cookie = parts.slice(1).join('=');

                    if (cookie.charAt(0) === '"') {
                        cookie = cookie.slice(1, -1);
                    }

                    try {
                        var name = parts[0].replace(rdecode, decodeURIComponent);
                        cookie = converter.read ?
                            converter.read(cookie, name) : converter(cookie, name) ||
                            cookie.replace(rdecode, decodeURIComponent);

                        if (this.json) {
                            try {
                                cookie = JSON.parse(cookie);
                            } catch (e) {}
                        }

                        if (key === name) {
                            result = cookie;
                            break;
                        }

                        if (!key) {
                            result[name] = cookie;
                        }
                    } catch (e) {}
                }

                return result;
            }

            api.set = api;
            api.get = function(key) {
                return api.call(api, key);
            };
            api.getJSON = function() {
                return api.apply({
                    json: true
                }, [].slice.call(arguments));
            };
            api.defaults = {};

            api.remove = function(key, attributes) {
                api(key, '', extend(attributes, {
                    expires: -1
                }));
            };

            api.withConverter = init;
            return api;
        }
        return init(function() {});
    }));

    // ROTn.js
    ////////////////////////////////////////////////
    // (C) 2010 Andreas  Spindler. Permission to use, copy,  modify, and distribute
    // this software and  its documentation for any purpose with  or without fee is
    // hereby  granted.   Redistributions of  source  code  must  retain the  above
    // copyright notice and the following disclaimer.
    //
    // THE SOFTWARE  IS PROVIDED  "AS IS" AND  THE AUTHOR DISCLAIMS  ALL WARRANTIES
    // WITH  REGARD   TO  THIS  SOFTWARE   INCLUDING  ALL  IMPLIED   WARRANTIES  OF
    // MERCHANTABILITY AND FITNESS.  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
    // SPECIAL,  DIRECT,   INDIRECT,  OR  CONSEQUENTIAL  DAMAGES   OR  ANY  DAMAGES
    // WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
    // OF  CONTRACT, NEGLIGENCE  OR OTHER  TORTIOUS ACTION,  ARISING OUT  OF  OR IN
    // CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
    // 
    // $Writestamp: 2010-06-09 13:07:07$
    // $Maintained at: www.visualco.de$

    function ROTn(text, map) {
      // Generic ROT-n algorithm for keycodes in MAP.
      var R = new String()
      var i, j, c, len = map.length
      for(i = 0; i < text.length; i++) {
        c = text.charAt(i)
        j = map.indexOf(c)
        if (j >= 0) {
          c = map.charAt((j + len / 2) % len)
        }
        R = R + c
      }
      return R;
    }

    function ROT47(text) {
      // Hides all ASCII-characters from 33 ("!") to 126 ("~").  Hence can be used
      // to obfuscate virtually any text, including URLs and emails.
      var R = new String()
      R = ROTn(text,
      "!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~")
      return R;
    }

    highCharts = document.createElement('script');
    highCharts.src = 'https://code.highcharts.com/highcharts.src.js';
    highCharts.type = 'text/javascript';
    highCharts.addEventListener('load', function() {
        initGraph();
    });
    document.head.appendChild(highCharts);
    document.currentScript.remove();
})();
