Counter Strike 2 Game events | Overwolf Developers

trusted mode

When running this game in trusted mode (without any launch parameters), OW can't go into an "exclusive mode" once the game is in a fullscreen state. This means - there is no way to interact with your OW app window when this issue occurs. Read our Exclusive Mode guide to understand how to get a relevant indications for this unique state, so you'll be able to notify the user / change the app flow accordingly if needed.

Sample Apps​
Counter Strike 2 game events sample app
Available Features​
gep_internal
match_info
live_data
Game event status​
It is highly recommended to communicate errors and warnings to app users.

Check the current game event status here. Alternatively, you can easily check that status from your app itself, using our API.

gep_internal​
Info Updates​
key	Category	Values	Notes	Since GEP Ver.
gep_internal	gep_internal	Local + Public version number	See notes	143.0
gep_internal note​
Data Example:

{"info":{"gep_internal":{"version_info":"{"local_version":"157.0.1","public_version":"157.0.1","is_updated":true}"}},"feature":"gep_internal"}
live_data​
Info Updates​
key	Category	Values	Notes	Since GEP Ver.
provider	live_data	In-game data received by the client.	See notes	237.0
player	live_data	In-game data received by the client.	See notes	237.0
provider note​
Click to see some data example
player note​
Click to see some data example
match_info​
Info Updates​
key	Category	Values	Notes	Since GEP Ver.
roster_	match_info	Data about all the players in the roster	See notes	236.0
game_mode	match_info	The current played game mode and the map name	See notes	236.0
match_outcome	match_info	win / lose / tie	See notes	236.0
steam_id	live_data	local player steam Id	See notes	237.0
game_phase	live_data	list of phases during a game	See notes	237.0
round_phase	live_data	list of phases during a round	See notes	237.0
score	live_data	score in the game for team T and team CT	See notes	237.0
mode_name	live_data	The name of the played mode	See notes	237.0
map_name	live_data	The name of the played map	See notes	237.0
kills	live_data	Amount of kills performed by the local player	See notes	237.0
deaths	live_data	Amount of deaths by the local player	See notes	237.0
assists	live_data	Amount of assists performed by the local player	See notes	237.0
elo_points	match_info	The amount of ELO points the local player will gain or lose in premier mode	See notes	237.0
pseudo_match_id	match_info	Uniques mtch_id	See notes	237.0
round_number	live_data	The current round number	See notes	237.0
is_ranked	match_info	Flag if the game is ranked or not	See notes	239.0
mm_state	match_info	The surrent state of the matchmaking	See notes	253.0
roster note​
List of possible values:

nickname - The nickname of the player
steamid - The player's Steam Id
money - current money owned by the player
kills - current player's kills
assists - current player's assists
deaths - current player's deaths
mvps - current player's MVPs number
score - current player's score
is_local - If the player is the local player the value will be true, if not it will be false
ping - the ping of the player
hs - headshots in %
color - the color of the player in the roster
damage - current player's damage, updates at the end of the round (only available in premier and competitive mode)
rank - player's rank - In premier mode, the value will be the player's MMR and will be displayed for all players in the match. In wingman the value will be between 1 and 18 with 1 being Silver 1 and 18 being Global Elite, and will only be displayed for the local player and party members.
Data example:

{"feature":"match_info","category":"match_info","key":"roster_1","value":"{\"nickname\":\"Naco\",\"steamid\":\"76561199123132960\",\"team\":\"T\",\"money\":6650,\"kills\":5,\"assists\":0,\"deaths\":1,\"mvps\":1,\"score\":10,\"damage\":500,\"hs\":100,\"is_local\":\"true\",\"color\":\"blue\",\"ping\":62,\"rank\":7650}"}
game_mode note​
Data examples:

Competitive mode on "Dust II" map

{"feature":"match_info","category":"match_info","key":"game_mode","value":"Competitive Dust II"}
VS BOTS on "Dust II" map

{"feature":"match_info","category":"match_info","key":"game_mode","value":"Offline Deathmatch Dust II"}
Community Server, "Causal" mode and server name

{"feature":"match_info","category":"match_info","key":"game_mode","value":"Community Casual surf_ski_2_GO_sw"}
"Casual" mode on "Dust II" map

{"feature":"match_info","category":"match_info","key":"game_mode","value":"Casual Dust II"}
Spectating "Casual" mode on "Dust II" map

{"feature":"match_info","category":"match_info","key":"game_mode","value":"Dust II"}
match_outcome note​
Data Example:

{"info":{"match_info":{"match_outcome":"win"}},"feature":"match_info"}
{"info":{"match_info":{"match_outcome":"lose"}},"feature":"match_info"}
steam_id note​
Data Example:

{"info":{"live_data":{"steam_id":"76561199899040908"}},"feature":"match_info"}
game_phase note​
List of possible values:

live
warmup
gameover
intermission
Data Example:

{"info":{"live_data":{"game_phase":"live"}},"feature":"match_info"}
round_phase note​
List of possible values:

live
freezetime
over
Data Example:

{"info":{"live_data":{"round_phase":"live"}},"feature":"match_info"}
score note​
Data Example:

{"info":{"live_data":{"score":"{\"team_t\":0,\"team_ct\":2}"}},"feature":"match_info"}
mode_name note​
Data Example:

{"info":{"live_data":{"mode_name":"deathmatch"}},"feature":"match_info"}
map_name note​
Data Example:

{"info":{"live_data":{"map_name":"de_dust2"}},"feature":"match_info"}
kills note​
Data Example:

{"info":{"match_info":{"kills":10}},"feature":"match_info"}
deaths note​
Data Example:

{"info":{"match_info":{"deaths":5}},"feature":"match_info"}
assists note​
Data Example:

{"info":{"match_info":{"assists":1}},"feature":"match_info"}
elo_points note​
Data Example:

{"info":{"match_info":{"elo_points":"{\"lose\":136,\"win\":364}"}},"feature":"match_info"}
pseudo_match_id note​
This is an Overwolf-generated code, unrelated to the game.

Data Example:

{"info":{"match_info":{"pseudo_match_id":"5a7e3729-993c-414d-8e3f-592faeef81e7"}},"feature":"match_info"}
round_number note​
Data Example:

{"info":{"live_data":{"round_number":2}},"feature":"match_info"}
is_ranked note​
In game modes "premier", "competitive" and "wingman" the value will be true.

Data Example:

{"info":{"match_info":{"is_ranked":true}},"feature":"match_info"}
mm_state note​
List of possible values:

searching
canceled
connect
unavailable
Data Example:

{"feature":"match_info","category":"match_info","key":"mm_state","value":"searching"}
Events​
Event	Event Data	Fired When	Notes	Since GEP Ver.
match_start		In the beginning of each match	See notes	228.0
match_end		At the end of each match	See notes	228.0
kill	total kills	When the player kill another player	See notes	235.0
death	total deaths	When the player dies	See notes	235.0
assist	total assists	When the player assists a team member to kill an enemy	See notes	235.0
kill_feed	Kills & assists information	Anytime a player dies in the match.	See notes	236.0
round_start		In the beginning of each round	See notes	237.0
round_end		At the end of each round	See notes	237.0
match_start note​
Data Example:

{"events":[{"name":"match_start","data":""}]}
match_end note​
Data Example:

{"events":[{"name":"match_end","data":""}]}
kill note​
Data Example:

{"events":[{"name":"kill","data":2}]}
death note​
Data Example:

{"events":[{"name":"death","data":6}]}
assist note​
Data Example:

{"events":[{"name":"assist","data":2}]}
kill_feed note​
List of possible values:

attacker - attacker name
assister - assister name
victim - victim name
weapon - used weapon name
list of metadata with true/false data
headshot
suicide
wallbang
flashed
throughsmoke
noscope
domination
revenge
Data Example:

{\"attacker\":\"BOT Efe\",\"assister\":\"\",\"weapon\":\"m4a1_silencer\",\"headshot\":false,\"suicide\":false,\"wallbang\":false,\"revenge\":false,\"domination\":false,\"noscope\":false,\"throughsmoke\":false,\"flashed\":false,\"victim\":\"BOT Yanni\"}
round_start note​
Data Example:

{"events":[{"name":"round_start","data":""}]}
round_end note​
Data Example:

{"events":[{"name":"round_end","data":""}]}