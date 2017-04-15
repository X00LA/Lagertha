/*
 * Copyright (C) 2017 phantombot.tv
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/*
 * @author IllusionaryOne
 */

/*
 * globalPanel.js
 * Drives queries and presentation on the index page.
 */
(function () {

    var streamOnline = false,
        whisperMode = false,
        responseMode = false,
        meMode = false,
        pauseMode = false;

    /*
     * @function well... these are some new additions from Mindful Design ;D
     */

    function switchTheme() {
        if ($("#themeChange").attr('href') === "panel/css/mindfuldesign.css") {
            $("#themeChange").attr("href", "panel/css/mindfuldesignDark.css");
        } else {
            $("#themeChange").attr("href", "panel/css/mindfuldesign.css")
        }
    }

    function liveStream() {
        if ($("#hideShow").is(":visible")) {
            $("#hideShow").fadeOut(1000);
            $("#hideShow3").fadeOut(1000);
            $("#hideShow4").fadeOut(1000);
            setTimeout(function largeVideo() {
                $("#hideShow2").attr('class', 'col-md-12 col-sm-12 col-xs-12');
            }, 1000)
        }
    }

    function preStream() {
        if ($("#hideShow").is(":hidden")) {
            $("#hideShow2").attr('class', 'col-md-8 col-sm-12 col-xs-12');
            $("#hideShow2").css("margin-left", "33.33333333%");
            setTimeout(function smallVideo() {
                $("#hideShow2").css("margin-left", "0%");
                $("#hideShow").fadeIn(1000);
                $("#hideShow3").fadeIn(2000);
                $("#hideShow4").fadeIn(3000);
            }, 1000)
        }
    }

    /*
     * @function onMessage
     * This event is generated by the connection (WebSocket) object.
     */
    function onMessage(message) {
        var msgObject;

        try {
            msgObject = JSON.parse(message.data);
        } catch (ex) {
            return;
        }

        if (panelHasQuery(msgObject)) {
            if (panelCheckQuery(msgObject, 'global_panelStatsEnabled')) {
                if (panelMatch(msgObject['results']['enabled'], 'true')) {
                    if (!panelStatsEnabled) {
                        panelStatsEnabled = true;
                        doQuery(); // Run the query again to populate fields.
                    }
                } else {
                    $('#panelStatsEnabled').html('<span>Panel Stats are Disabled</span>');
                }
            }

            if (panelCheckQuery(msgObject, 'global_streamOnline')) {
                streamOnline = (panelMatch(msgObject['results']['streamOnline'], 'true'));
                if (streamOnline) {
                    $('#streamOnline').html('<span data-toggle="tooltip" title="Stream Online" data-placement="bottom" style="padding-right: 10px;"><i style="top: -1px;" class="fa fa-wifi fa-rotate-90 live-blink"></i><span style="color: #FF4A55; font-weight: bold;font-variant: normal;">  live</span></span>');
                    $('#streamOnline2').html('<i style="padding-bottom: 19px; padding-left: 1px; padding-top: 0px; padding-right: 0px; top: -1px;" class="fa fa-wifi fa-rotate-90 live-blink"></i>');
                } else {
                    $('#streamOnline').html('<span data-toggle="tooltip" title="Stream Offline" data-placement="bottom" style="padding-right: 10px;"><span style="color: #1DC7EA;font-variant: normal;">offline</span></span>');
                    $('#streamOnline2').html('<i style="padding-bottom: 19px; padding-left: 1px; padding-top: 0px; padding-right: 0px; color: #1DC7EA; top: -1px;" class="fa fa-wifi fa-rotate-90"></i>');
                }
            }

            if (panelCheckQuery(msgObject, 'global_whisperMode')) {
                whisperMode = (panelMatch(msgObject['results']['whisperMode'], 'true'));
            }
            if (panelCheckQuery(msgObject, 'global_muteMode')) {
                responseMode = (panelMatch(msgObject['results']['response_@chat'], 'true'));
            }
            if (panelCheckQuery(msgObject, 'global_toggleMe')) {
                meMode = (panelMatch(msgObject['results']['response_action'], 'true'));
            }
            if (panelCheckQuery(msgObject, 'global_commandsPaused')) {
                $.globalPauseMode = (panelMatch(msgObject['results']['commandsPaused'], 'true'));
            }

            if (whisperMode) {
                $('#whisperModeStatus').html('<span data-toggle="tooltip" data-placement="bottom" title="Whisper Mode" style="padding-right: 10px;"><span class="notification-modes hidden-sm hidden-xs"><i style="color: #1DC7EA" class="fa fa-user-secret" /></span><sub>whisper mode</sub></span>');
                $('#whisperModeStatus2').html('<i style="color: #1DC7EA" class="fa fa-user-secret" />');
            } else {
                $('#whisperModeStatus').html('');
                $('#whisperModeStatus2').html('');
            }

            if (meMode) {
                $("#meModeStatus").html('<span data-toggle="tooltip" data-placement="bottom" title="Action (/me) Mode" style="padding-right: 10px;"><span class="notification-modes hidden-sm hidden-xs"><i style="color: #1DC7EA" class="fa fa-hand-paper-o" /></span><sub>action mode</sub></span>');
                $("#meModeStatus2").html('<i style="padding-left: 18px; color: #1DC7EA" class="fa fa-hand-paper-o" />');
            } else {
                $("#meModeStatus").html('');
                $("#meModeStatus2").html('');
            }
            if (!responseMode) {
                $("#muteModeStatus").html('<span data-toggle="tooltip" data-placement="bottom" title="Mute Mode" style="padding-right: 10px;"><span class="notification-modes hidden-sm hidden-xs"><i style="color: #1DC7EA" class="fa fa-microphone-slash" /></span><sub>lagertha muted</sub></span>');
                $("#muteModeStatus2").html('<i style="color: #1DC7EA" class="fa fa-microphone-slash" />');
            } else {
                $("#muteModeStatus").html('');
                $("#muteModeStatus2").html('');
            }

            if ($.globalPauseMode) {
                $("#commandPauseStatus").html("<span data-toggle=\"tooltip\" data-placement=\"bottom\" title=\"Commands Paused\" style=\"padding-right: 10px;\"><span class=\"notification-modes hidden-sm hidden-xs\"><i style=\"color: #1DC7EA\" class=\"fa fa-pause-circle-o\" /></span><sub>commands paused</sub></span>");
                $("#commandPauseStatus2").html("<i style=\"color: #1DC7EA\" class=\"fa fa-pause-circle-o\" />");
            } else {
                $("#commandPauseStatus").html("");
                $("#commandPauseStatus2").html("");
            }

            if (streamOnline) {
                if (panelCheckQuery(msgObject, 'global_streamUptime')) {
                    $("#streamUptime").html("<span data-toggle=\"tooltip\" data-placement=\"bottom\" title=\"Uptime\" style=\"padding-right: 10px;\"><span><span class=\"notification hidden-sm hidden-xs\">" + msgObject['results']['streamUptime'] + "</span><sub>uptime</sub></span></span>");
                    $("#streamUptime2").html(msgObject['results']['streamUptime']);
                }
                if (panelCheckQuery(msgObject, 'global_playTime')) {
                    $("#timePlayed").html("<span data-toggle=\"tooltip\" data-placement=\"bottom\" title=\"Time Played\" style=\"padding-right: 10px;\"><span><span class=\"notification hidden-sm hidden-xs\">" + msgObject['results']['playTime'] + "</span><sub>time played</sub></span></span>");
                    $("#timePlayed2").html(msgObject['results']['playTime']);
                }
                if (panelCheckQuery(msgObject, 'global_viewerCount')) {
                    $("#viewerCount").html("<span data-toggle=\"tooltip\" data-placement=\"bottom\" title=\"Viewers\" style=\"padding-right: 10px;\"><span><span class=\"notification hidden-sm hidden-xs\">" + msgObject['results']['viewerCount'] + "</span><sub>viewers</sub></span></span>");
                    $("#viewerCount2").html(msgObject['results']['viewerCount']);
                }
            } else {
                $("#streamUptime").html('');
                $("#streamUptime2").html('-');
                $("#timePlayed").html('');
                $("#timePlayed2").html('-');
                $("#viewerCount").html('');
                $("#viewerCount2").html('-');
            }

            if (panelCheckQuery(msgObject, 'global_dsToggle')) {
                if (msgObject['results']['timerToggle'] !== undefined && msgObject['results']['timerToggle'] !== null) {
                    if (panelMatch(msgObject['results']['timerToggle'], 'true')) {
                        $('#multiStatus').html('<span data-toggle="tooltip" data-placement=\"bottom\" title="Multi-Link Enabled" style=\"padding-right: 10px;\"><i class="fa fa-link" /></span>');
                    } else {
                        $('#multiStatus').html('');
                    }
                }
            }

            if (panelCheckQuery(msgObject, 'global_newrelease_info')) {
                var release_info = msgObject['results']['newrelease_info'];
                if (msgObject['results']['newrelease_info'] !== undefined && msgObject['results']['newrelease_info'] !== null) {
                    var newVersionData = msgObject['results']['newrelease_info'].split('|'),
                        changeLog = 'https://github.com/PhantomBot/PhantomBot/releases/' + newVersionData[0];
                    $('#newVersionDialog').html('Version <b>' + newVersionData[0] + '</b> of PhantomBot is now available for download! Review the changelog for details!<br><br>' +
                        '<b>Release Changelog:</b><br><a target="_blank" href="' + changeLog + '">' + changeLog + '</a><br><br>' +
                        '<b>Download Link:</b><br><a target="_blank" href="' + newVersionData[1] + '">' + newVersionData[1] + '</a><br><br>');
                    $('#newVersionAvailable').html('<span data-toggle="tooltip" data-placement=\"bottom\" style=\"padding-right: 10px;\" title="New Version Available! Click for more information."' +
                        'onclick="$(\'#newVersionDialog\').dialog(\'open\')"><span class="notification hidden-sm hidden-xs">new</span><sub>update</sub></span>');

                } else {
                    $('#newVersionAvailable').html('');
                }
            }

            $('[data-toggle="tooltip"]').tooltip();
        }
    }

    /**
     * @function doQuery
     */
    function doQuery() {
        sendDBQuery("global_newrelease_info", "settings", "newrelease_info");
        sendDBQuery("global_whisperMode", "settings", "whisperMode");
        sendDBQuery("global_muteMode", "settings", "response_@chat");
        sendDBQuery("global_toggleMe", "settings", "response_action");
        sendDBQuery("global_commandsPaused", "commandPause", "commandsPaused");
        sendDBQuery("global_dsToggle", "dualStreamCommand", "timerToggle");

        if (!panelStatsEnabled) {
            sendDBQuery("global_panelStatsEnabled", "panelstats", "enabled");
        } else {
            sendDBQuery("global_viewerCount", "panelstats", "viewerCount");
            sendDBQuery("global_streamOnline", "panelstats", "streamOnline");
            sendDBQuery("global_streamUptime", "panelstats", "streamUptime");
            sendDBQuery("global_playTime", "panelstats", "playTime");
        }
    }

    // Load the DB items for this panel, wait to ensure that we are connected.
    var interval = setInterval(function () {
        if (isConnected) {
            doQuery();
            clearInterval(interval);
        }
    }, INITIAL_WAIT_TIME);

    // Query the DB every 20 seconds for updates.
    setInterval(function () {
        if (isConnected) {
            doQuery();
        }
    }, 2e4);

    // Export functions - Needed when calling from HTML.
    $.globalOnMessage = onMessage;
    $.globalDoQuery = doQuery;
    $.globalPauseMode = pauseMode;
    $.switchTheme = switchTheme;
    $.liveStream = liveStream;
    $.preStream = preStream;
})();
