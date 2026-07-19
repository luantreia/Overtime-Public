import type { Reglamento, Regla, Clausula } from '../types';

// Transcripción del reglamento oficial "WDBF Cloth Dodgeball Rules 2026" (World Dodgeball Federation).
// Texto verbatim en inglés (idioma original del documento oficial). En un puñado de reglas cuyo diseño
// en columnas no preservaba el número exacto de sub-inciso en la extracción del PDF, la numeración fue
// reconstruida en orden lógico; el texto de cada cláusula siempre es textual al original.

const c = (numero: string, texto: string, hijos?: Clausula[]): Clausula => ({ numero, texto, hijos });
const r = (numero: string, titulo: string, clausulas: Clausula[]): Regla => ({ numero, titulo, clausulas });

const definiciones = r('', 'Definitions', [
  c('', 'Live Ball — A live ball is a ball that has been thrown and can get a player out.'),
  c('', 'Dead Ball — A dead ball is a ball that can no longer get a player out.'),
  c('', 'Dead Object — A dead object is anything that is not an active player in bounds or a live ball.'),
  c('', 'Active Player — A player on the roster who is participating in a set.'),
  c('', 'Live Player — A live player is an active player that is not eliminated.'),
  c('', 'Exiting Player — An exiting player is an active player that was eliminated and is in the process of returning to the queue.'),
  c('', 'Out Player — An out player is an active player that has been eliminated and is waiting in the queue.'),
  c('', "Entering Player — An entering player is an active player that is in the process of reentering play after a successful catch by their team."),
  c('', "Possession — A ball is in possession of a team if it is stationary within a team's half of the court outside the neutral zone or in the hands of a ball retriever. The ball does not have to be within the boundary lines to be in possession. A ball is in possession of a player, if they are touching the ball and are in the process of picking it up."),
  c('', 'Control — A ball is in control of a team if it is held by a live player.'),
  c('', 'Short-handed — Starting a set with less than 6 players on court.'),
]);

const rule1 = r('1', 'Playing Area', [
  c('', 'The Playing Area is a flat rectangular area that includes the playing court, free space, queue area, penalty area, and substitution area. It should be enclosed by barriers or netting on all four sides to prevent balls from exiting.'),
  c('1.1', 'Dimensions', [
    c('', 'The playing court is a rectangle with dimensions of 18 meters in length by 9 meters in width, surrounded by free space, which is a minimum of 1 meter wide on all sides.'),
    c('', 'The space above the playing court must be free from any obstructions. This area shall be a minimum of 4 meters in height from the playing surface.'),
  ]),
  c('1.2', 'Playing Surface', [
    c('', 'The surface must be flat and horizontal. It must not present any danger to any participants of a match. It is not allowed to play on a rough or slippery surface.'),
  ]),
  c('1.3', 'Lines on the Court', [
    c('1.3.1', 'All lines are 5 cm wide. They must be of the same color, which is different from the color of the floor or any other lines. Should the court be set up to facilitate both playing formats, the neutral zone and attack lines for the Cloth playing format must use a different color than the boundary lines (see Diagram 1).'),
    c('1.3.2', 'Boundary Lines — The boundary lines consist of two side lines and two back lines that mark the playing court. Both side lines and back lines are drawn inside the dimensions of the playing court.'),
    c('1.3.3', 'Center Line — The axis of the center line divides the playing court into two equal sides. It shall extend at least 1 meter outside of the side lines.'),
    c('1.3.4', 'Attack Line — On each court, an attack line is drawn, whose rear edge is 5.5 meters back from the axis of the center line.'),
    c('1.3.5', 'Neutral Zone Line — On each court, a neutral zone line, whose rear edge is drawn within the boundary lines 7 meters from the back of the rear edge of the back line.'),
    c('1.3.6', 'Ball Markings — On the center line 5 ball markings are drawn, centered on the midpoint of the line with a distance of 1.5 meters between each marking.'),
  ]),
  c('1.4', 'Zones and Areas', [
    c('1.4.1', 'Fair territory — The fair territory is the area from the back line to the neutral zone line on each court, enclosed by the side lines. The back line, neutral zone line, and side lines are not included in the fair territory.'),
    c('1.4.2', 'Neutral zone — The neutral zone is the area between, but not including, the two neutral zone lines on the playing court, enclosed by the side lines.'),
    c('1.4.3', 'Queue Area — The queue area is an area of 4 meters in length and 1 meter in width, located 1 meter away from the side line of the court and its rear edge aligning with the rear edge of the back line. There is one queue area on each side of the center line and both queue areas shall be on the same side. It shall be marked with lines.'),
    c('1.4.4', 'Penalty Area — The penalty area is 1 meter in length and width, extended from the queue area towards the direction of the center line. It shall be marked with lines.'),
    c('1.4.5', 'Substitution Area — The substitution area is located behind the queue area and penalty areas and extends to the end of the playing area. The sides shall be marked with lines by extending the lines of the queue area and the penalty area.'),
    c('1.4.6', 'Playing Court — The playing court is the area enclosed by the boundary lines and includes each teams fair territory and the neutral zone.'),
  ]),
]);

const rule2 = r('2', 'Balls', [
  c('2.1', 'Dodgeball is played with 5 balls.'),
  c('2.2', 'All balls shall be made of a textured no-sting cloth with a 2–4mm layer of foam directly underneath and a butyl bladder covered by webbing inside.'),
  c('2.3', 'A ball shall have a diameter of 17.78 cm (7 in) and an internal pressure of 1.6–1.8 psi (110–125 mbar; 0.112–0.126 kg/cm²).'),
  c('2.4', 'The ball shall be spherical in shape and be uniform in circumference, weight and pressure.'),
  c('2.5', 'Head referees may deem balls unfit for play and can replace them before or during a match.'),
]);

const rule3 = r('3', 'Scoring and Timing Devices', [
  c('3.1', 'There is one official timing device for the running half time on one side of the court.'),
  c('3.2', 'There is one official timing device for the running set time on one side of the court.'),
  c('3.3', 'There is one official scoring device on one side of the court.'),
  c('3.4', 'Timing and/or scoring devices may be combined into a single device.'),
]);

const rule4 = r('4', 'Team', [
  c('4.1', 'A team may have a minimum of 6 players and no more than 12 players on roster at the start of each match.'),
  c('4.2', '6 active players per team participate in a set. These 6 players must remain within the confined areas of court, player out queue or penalty area.'),
  c('4.3', "Any player from the team roster not active at the start of a set must remain within the substitution area or outside the playing area."),
  c('4.4', 'A team may have up to 3 designated ball retrievers at the start of each set.'),
  c('4.5', 'Any player not active at the start of a set may be designated as a ball retriever.'),
  c('4.6', "Ball retrievers may enter any of the designated areas within the playing area other than the playing court to retrieve a ball up to the center line of their respective team's side during a set."),
  c('4.7', 'Ball retrievers may only leave the playing area during a set to retrieve balls.'),
]);

const rule5 = r('5', 'Team Leaders', [
  c('5.1', 'A team may have no more than two designated leaders (coaches, assistant coaches, or managers) within the playing area during a match.'),
  c('5.2', 'Team leaders must remain within the confined areas of the player out queue, substitution and penalty area.'),
  c('5.3', 'Team leaders may not enter the playing court during a set, unless authorized by a match official.'),
  c('5.4', 'A player may be designated as a team leader and will be treated as such while not an active player during a set.'),
]);

const rule6 = r('6', 'Uniforms', [
  c('6.1', 'All players on a team must wear uniforms identical in color and design, but may vary in cut and length, except when a player is forced to change uniforms due to damage or blood injury.'),
  c('6.2', 'Each player must be identified by a unique number (0-99) on the back and front of the uniform. The number on the back must be on the top part of the uniform.'),
  c('6.3', 'Team captains of a team must be clearly identifiable.'),
  c('6.4', 'Ball retrievers may not wear a uniform similar in nature to the team in which they represent.'),
  c('6.5', 'Team leaders must be clearly identified and not mistaken for regular players.'),
  c('6.6', 'Match officials must be clearly identified and not mistaken for regular players.'),
]);

const rule7 = r('7', 'Player Equipment', [
  c('7.1', 'Headgear', [
    c('7.1.1', 'Headbands and protective helmets are the only permitted headgear for players.'),
    c('7.1.2', 'Religious headwear may be worn as long as it is not dangerous to the player wearing it and/or other players.'),
  ]),
  c('7.2', 'Casts and Prostheses', [
    c('7.2.1', 'Prostheses may be worn. All casts, braces and splints with exposed hard surfaces must be padded.'),
    c('7.2.2', 'No player will be allowed to play, should a match official determine that their equipment poses a risk to the safety of other players or that the use thereof changes the fundamental nature of the game or give the player any other advantage.'),
  ]),
  c('7.3', 'Gloves', [
    c('7.3.1', 'Gloves must not be worn except when medically necessary. The medical need must be proven by the player.'),
    c('7.3.2', 'Any medically necessary gloves must not enhance the ability of a player in the game.'),
  ]),
  c('7.4', 'Jewelry', [
    c('7.4.1', 'Exposed jewelry, judged as dangerous by the match officials, must be removed and may not be worn during the match.'),
    c('7.4.2', "Any jewelry that can't be removed must be taped and approved by a match official."),
  ]),
  c('7.5', 'Goggles', [
    c('7.5.1', 'Goggles or sporting glasses may be worn and must be secured with head straps. If goggles or sporting glasses cannot be secured with head straps, they may only be worn after approval by a match official.'),
  ]),
  c('7.6', 'Shoes', [
    c('7.6.1', 'Shoes must be worn at all times.'),
    c('7.6.2', 'All shoes must be made of canvas, leather or similar material with a rubber non-marking sole.'),
    c('7.6.3', 'Shoes, judged as unsafe by the match officials, must not be worn.'),
  ]),
  c('7.7', 'Other Equipment and Substances', [
    c('7.7.1', 'Any other equipment may only be used after approval by the head referees.'),
    c('7.7.2', "Substances applied to the exterior of the team uniform or onto the skin of a player which enhances a player's ability to throw or catch a ball must not be used. This does not apply for commercially available dry or liquid chalk."),
    c('7.7.3', "Substances applied to a player's skin for medical reasons must be covered by a dressing, except when approved by the head referees."),
    c('7.7.4', 'Substances applied to aid a player injury are allowed to be applied.'),
  ]),
]);

const rule8 = r('8', 'Style of Play', [
  c('8.1', 'The style of play is determined by the type of ball used. The format used in this ruleset is Cloth.'),
]);

const rule9 = r('9', 'Timing', [
  c('9.1', 'Length of the Match', [
    c('9.1.1', 'A match lasts for two equal halves of 20 minutes with a 5-minute half-time break.'),
    c('9.1.2', 'At the end of a half, teams change sides.'),
    c('9.1.3', 'If the teams cannot agree on which side of the court to start the match, the sides shall be determined by a coin toss.'),
  ]),
  c('9.2', 'Set', [
    c('9.2.1', 'A match consists of an indeterminate number of sets.'),
    c('9.2.2', 'The maximum duration of each set is 3 minutes.'),
    c('9.2.3', 'A set starts with the opening rush.'),
    c('9.2.4', 'A set ends', [
      c('(1)', 'when the set time runs out, or'),
      c('(2)', 'when all players of a team are eliminated.'),
    ]),
    c('9.2.5', 'After a set ends, officials will wait 30 seconds for teams to reset. Should a team not be ready after 30 seconds, it may receive a verbal warning or team yellow card, upon discretion of a match official.'),
  ]),
  c('9.3', 'Starting a Half', [
    c('9.3.1', 'Both teams must be lined up for the opening rush at the scheduled time for the start of each half.'),
  ]),
  c('9.4', 'Match Clock', [
    c('9.4.1', 'The match clock shall start with the start of the first set of each half.'),
    c('9.4.2', 'The match clock shall only be stopped', [
      c('(1)', 'when a set ends and the remaining time in a half mandates a final set;'),
      c('(2)', 'when the referee suspends play.'),
    ]),
  ]),
  c('9.5', 'Set Clock', [
    c('9.5.1', 'The set clock is started at the start of each set.'),
    c('9.5.2', 'The set clock shall only be stopped when the referee suspends play.'),
  ]),
  c('9.6', 'Final Set', [
    c('9.6.1', 'A final set shall be played if a set ends with less than 120 seconds remaining on the match clock.', [
      c('(1)', 'The duration of the final set is 90 seconds.'),
      c('(2)', 'In the event of a false start, the 90 seconds will reset.'),
      c('(3)', 'The half ends, when the final set ends.'),
    ]),
  ]),
  c('9.7', 'Tie-Breaking Set', [
    c('9.7.1', 'A tie-breaking set shall be played if a match cannot end in a draw.'),
    c('9.7.2', 'The duration of the tie-breaking set is 3 minutes.'),
    c('9.7.3', 'If a winner cannot be determined after the end of the set, the referees call "sudden death", and the first team to eliminate a player will win the set.'),
    c('9.7.4', 'If the teams cannot agree on which side of the court to play for the tie-breaking set, the sides shall be determined by a coin toss.'),
  ]),
  c('9.8', 'Timeouts', [
    c('9.8.1', 'Each team is allowed 1 timeout in each half.'),
    c('9.8.2', 'A timeout shall be 60 seconds in length.'),
    c('9.8.3', 'Timeouts must be requested by a qualified team leader after a set has ended and before the referee has called the teams to line up.'),
    c('9.8.4', 'During a timeout the match shall be stopped.'),
  ]),
  c('9.9', 'Suspended Play', [
    c('9.9.1', 'Referees can suspend play at any time during the match.'),
    c('9.9.2', 'While play is suspended by a referee all clocks shall be stopped.'),
    c('9.9.3', 'While play is suspended by a referee all participants must remain in their designated areas.'),
    c('9.9.4', 'While play is suspended, any balls not in control and within the neutral zone must remain at their location at the time of the stoppage. It is up to the match official to determine the location of a ball.'),
    c('9.9.5', 'Play shall resume from the point it was suspended with a reset.'),
  ]),
  c('9.10', 'Resets', [
    c('9.10.1', 'All live players must have one foot on the back line, when the referee signals continuation of the game.'),
    c('9.10.2', 'When the first player crosses the attack line after a reset, all players who are not completely within the court will be called out.'),
    c('9.10.3', "Teams are allowed to pick up and retrieve any ball within their half of the court, except for the neutral zone."),
  ]),
]);

const rule10 = r('10', 'Scoring', [
  c('10.1', 'Winning a Match', [
    c('10.1.1', 'A match is won by the team scoring the most points.'),
    c('10.1.2', 'A match can result in a draw if both teams have the same amount of points at the end of regular game time.'),
    c('10.1.3', 'If the competition rules require a winning team, a tie-breaking set is played.'),
  ]),
  c('10.2', 'Winning a Set', [
    c('10.2.1', 'A set is won, when', [
      c('(1)', 'a team has eliminated all players of the opposing team, or'),
      c('(2)', 'a team has more live or entering players than the opposing team after the designated set time runs out.'),
    ]),
    c('10.2.2', 'Winning a set grants 2 points.'),
    c('10.2.3', 'Losing a set grants 0 points.'),
  ]),
  c('10.3', 'Drawing a Set', [
    c('10.3.1', 'A set is drawn, when', [
      c('(1)', 'both teams have an equal number of live or entering players after the designated set time runs out, or'),
      c('(2)', 'both teams have no live or entering players after a simultaneous play has been resolved.'),
    ]),
    c('10.3.2', 'Drawing a set grants 1 point.'),
  ]),
]);

const rule11 = r('11', 'Forfeits', [
  c('11.1', 'When a team forfeits a set, the set ends immediately with the non-offending team winning the set.'),
  c('11.2', 'When a team forfeits a match, the match ends immediately, with the non-offending team winning the match.'),
  c('11.3', 'Should a team fail to appear before the scheduled start time, the team will forfeit a set and the match officials will wait an additional 3 minutes for the team to be present and ready for the next set, otherwise they will forfeit the match.'),
]);

const rule12 = r('12', 'Ball Position', [
  c('12.1', 'The balls are positioned on the center line, with one ball on each of the ball markings.'),
]);

const rule13 = r('13', 'Beginning of Play', [
  c('13.1', 'Play begins with all active players not serving a penalty positioned with one foot on the back line and the other foot inside the boundary lines.'),
  c('13.2', 'The match officials will use the following procedure to start play:', [
    c('(1)', 'call teams to "Line Up" to order teams to take their places;'),
    c('(2)', 'verify each team is ready by calling "Team Ready" for each team;'),
    c('(3)', 'pause approximately 1 second and then blow the whistle to start play.'),
  ]),
  c('13.3', 'With the start of play, all active players not serving a penalty become live players.'),
  c('13.4', 'Players must be fully within the boundary lines before the first player touches a ball on the center line.'),
  c('13.5', 'The two leftmost balls on each side are considered designated to the team and can only be retrieved by that team.'),
  c('13.6', 'The center ball is available for retrieval by both teams.'),
  c('13.7', 'When retrieving the designated balls, players may step onto or over the center line with one foot.'),
  c('13.8', 'Players may not slide or dive head first to retrieve any balls or they will be called out. Should match officials determine that the action was dangerous to themselves or others, the player will receive a yellow card.'),
  c('13.9', 'No physical contact between players is allowed, when retrieving the center ball. The offending player or players will be deemed out. Any incidental contact shall not be penalized.'),
  c('13.10', 'Apart from rule 13.7, players are only allowed to step onto or over the center line when', [
    c('(1)', 'all their designated balls have been activated, or'),
    c('(2)', 'they are carrying an activated ball, or'),
    c('(3)', 'a live ball has been thrown.'),
  ]),
  c('13.11', 'Ball Activation', [
    c('13.11.1', 'Any balls retrieved during the opening rush must fully cross the attack line to become activated. Any thrown ball that did not fully cross the attack line can still be caught, but cannot hit a player out.'),
    c('13.11.2', 'Players may retrieve any balls placed on the center line once all their designated balls have been activated.'),
    c('13.11.3', "Designated balls are considered activated immediately upon possession by the opponent's team."),
  ]),
]);

const rule14 = r('14', 'False Starts', [
  c('14.1', 'If a player\'s foot loses contact with the back line after "Team Ready" has been called, but before the whistle has been blown, it will be considered a false start.'),
  c('14.2', 'The offending team will forfeit all balls to the opposing team.'),
  c('14.3', 'All eliminations occurring after the false start and before the reset are void.'),
  c('14.4', 'After a false start, match officials shall suspend play to determine the outcome of the false start.'),
  c('14.5', 'Play shall resume with a reset.'),
  c('14.6', 'In the event of a false start by both teams, it is up to the match officials to determine which team committed the offence first. Should the match officials conclude that the false starts happened simultaneously, the set shall be restarted.'),
]);

const rule15 = r('15', 'Outs', [
  c('15.1', 'A live player shall be deemed out when hit by a live ball on any part of their body, including hair or on any part of their clothing.'),
  c('15.2', 'A hit player is out when they are no longer in contact with the ball that hit them.'),
  c('15.3', 'A hit player must cease all actions except', [
    c('(1)', 'catching the ball that hit them; and'),
    c('(2)', 'catching any other live ball, as long as they keep continuous contact with the ball from the moment it hits them to completion of the catch. This catch is considered void, but the player can continue to catch the ball that rendered them out initially.'),
  ]),
  c('15.4', 'When a ball that hit a player comes into contact with another live player or a dead object before a catch is complete, the hit player is rendered out.'),
]);

const rule16 = r('16', 'Attempts', [
  c('16.1', 'Balls may only be thrown by live players. A throw may be performed with one or both hands and be overhand, underhand, side arm or chest push/throw.'),
  c('16.2', "A throw must leave a player's hand. The thrown ball becomes a live ball once the player is no longer in contact with the ball."),
  c('16.3', 'Intentionally kicking or spiking a ball in an unsporting way will result in the offending player being deemed out.'),
  c('16.4', 'A player must not throw a ball once play has stopped or after being deemed out. If a match official determines that this has been done in a flagrant or unnecessary manner, the offending player will receive a yellow card.'),
  c('16.5', 'A player may make a block attack by blocking a live ball.'),
  c('16.6', 'A live ball becomes a dead ball once it touches a surface or a dead object that is not a ball.'),
]);

const rule17 = r('17', 'Valid and Invalid Attempts', [
  c('17.1', "Any ball transferred to the opponents' territory must be thrown, otherwise it is considered an invalid attempt."),
  c('17.2', "A valid attempt is a throw that lands or passes within 1 meter of a player or a player's position at the moment the ball was released."),
  c('17.3', "Any passing throws or non-throwing plays, such as rolling or kicking a ball, where the ball does not fully cross into the opponent team's fair territory or past the center line when out of bounds are not deemed attempts."),
  c('17.4', 'If a player fails to make a valid attempt they are deemed out.'),
  c('17.5', 'Carrying a ball into the neutral zone and leaving it there is also considered to be an invalid attempt.'),
  c('17.6', 'Performing an intentional or unintentional block attack shall always be considered a valid attempt.'),
  c('17.7', 'Dropping a ball to make a catch, if successful, shall never be considered an invalid attempt.'),
  c('17.8', 'Balls that were never in control by a player or ball retriever, which have been transferred accidentally, may not be considered invalid attempts.'),
]);

const rule18 = r('18', 'Advantage', [
  c('18.1', 'Advantage is given to the team that is in possession of the majority of the balls in play.'),
  c('18.2', 'Balls that are stationary in the neutral zone are considered in possession of the team that is closer to the balls, as determined by the match officials.'),
  c('18.3', 'A team with advantage is given 5 seconds to make attempts to no longer be in possession of the majority of the balls in play.'),
  c('18.4', 'If after 5 seconds of having advantage, the team is still in possession of the majority of the balls, the match officials will call "play n balls", with n being one less than the number of balls still in possession and no more than the number of live players on that team.'),
  c('18.5', 'The match officials may delay calling "play n balls" if the team with advantage has clearly started a throwing attempt. After the attempt concludes the match officials shall immediately call "play n balls", if the team is still in possession of the majority of the balls.'),
  c('18.6', 'After "play n balls" being called, the team with advantage must make n attempts within 5 seconds.'),
  c('18.7', 'If a team has failed to make enough attempts within 5 seconds of "play n balls" being called, players who failed to make an attempt shall be called out if', [
    c('(1)', 'they were in control of a ball at the moment "play n balls" was called; or'),
    c('(2)', "they were not in control of a ball at that moment. The number of players being called out under this rule shall not exceed the number of balls that were in the team's possession at the moment \"play n balls\" was called, but had not been thrown and did not result in a player being called out under (1)."),
  ]),
  c('18.8', 'It is up to the team\'s discretion to choose the players that are to be deemed out under 18.7 (2). Should a team fail to nominate enough players in a timely manner, players shall be chosen by the match officials.'),
  c('18.9', 'If a player in control of one or more balls has been eliminated before they could make an attempt, all balls in their control will be considered thrown for the purpose of "play n balls".'),
  c('18.10', 'If, after a team made enough attempts, it still has advantage, the match officials will immediately call "play n balls".'),
]);

const rule19 = r('19', 'Pinching', [
  c('19.1', 'A ball must not be held in a way that would damage it.'),
  c('19.2', "A player must not distort a ball in a way that would alter its normal flight pattern when thrown, otherwise they'll be called out."),
  c('19.3', 'If a player persistently violates this rule they will receive a yellow card at the discretion of the match officials.'),
]);

const rule20 = r('20', 'Blocking', [
  c('20.1', 'A player can use one or more balls to block a live ball from hitting them.'),
  c('20.2', 'A live ball remains a live ball after it has been blocked.'),
  c('20.3', 'The hands to the wrist of a player touching a ball are considered to be part of the ball and will not be considered a hit.'),
]);

const rule21 = r('21', 'Disarming', [
  c('21.1', 'When a player uses a ball to block a live ball and, as a result of that action, loses control of the blocking ball, they must regain control over it before it makes contact with any dead object or other player.'),
  c('21.2', 'If a player does not regain control before a loose ball makes contact with any dead object or other player, that player is rendered out.'),
]);

const rule22 = r('22', 'Catching', [
  c('22.1', 'A live ball may be caught by an opposing live player, rendering the attacking player out immediately after the catch is complete.'),
  c('22.2', 'A catch is deemed complete when the catching player is in control of the ball. Control can be established in the air, a catching player does not have to touch the ground to be considered in control of a ball.'),
  c('22.3', 'When a ball is caught, the first out player in or on their way to the queue of the catching team is allowed to reenter the court. This player becomes an entering player.'),
  c('22.4', 'A player is not allowed to use any part of his uniform to help them catch a live ball.'),
  c('22.5', 'A live ball becomes a dead ball once it is caught.'),
  c('22.6', 'If more than one player makes contact with a ball simultaneously, all players are considered out and the ball can no longer be caught by either player.'),
  c('22.7', "A player may jump into the opponent's fair territory to make a catch. If their action causes or risks causing contact with an opposing player, they will receive a yellow card."),
]);

const rule23 = r('23', 'Exiting Players', [
  c('23.1', 'A player is eliminated and considered an exiting player when', [
    c('(1)', 'they are deemed out due to a hit and are no longer trying to catch the ball that hit them out;'),
    c('(2)', 'they are deemed out any other way; and they have not reached the queue area.'),
  ]),
  c('23.2', 'An exiting player must raise their hand over their head to indicate that they are out.'),
  c('23.3', 'An exiting player must leave the playing area as quickly as possible over the nearest boundary line. They must then make their way to the player queue.'),
  c('23.4', 'An exiting player takes position at the end of the queue behind any players that have been eliminated previously.'),
  c('23.5', 'An exiting player must not intentionally impact play. If a match official determines that an exiting player has done so, they will receive a yellow card.'),
  c('23.6', 'An exiting player has to immediately drop all balls in their possession if they were rendered out in front of the attack line; otherwise they pass any balls in their possession to a player within their team. If a match official determines that an exiting player intentionally passes balls to another player, when they shouldn\'t have, they will receive a blue card.'),
  c('23.7', 'Balls thrown by exiting players cannot eliminate opponents but can be caught.'),
]);

const rule24 = r('24', 'Out Players', [
  c('24.1', 'An out player is a player who has been eliminated and is waiting in the queue to return to play.'),
  c('24.2', "Out players must not interfere with the path of any live ball. If an out player interferes with a live ball, the player may receive a yellow card and it is up to the referee's discretion to call a player of the offending team out, should they determine that the ball would have hit that player."),
  c('24.3', 'Out players may pass balls to ball retrievers or players, as long as they do not touch the ground outside their designated area with any part of their body, including hair or on any part of their clothing. When doing so, players must adhere to the rules for ball retrievers returning balls to play (Rule 31). If an out player violates this rule, they will receive a verbal warning or blue card. Continued infraction can be awarded a yellow card.'),
  c('24.4', "If an out player leaves the queue area for any reason, they must return to their original position upon returning. If it becomes that player's turn to return to play before they have returned to the queue area, the team forfeits the opportunity to return any players to play until that player returns to the queue area."),
  c('24.5', 'An out player who returns to the playing court out of order, will receive a blue card. The team also forfeits its opportunity to put a player into play instead and must wait for the next one.'),
]);

const rule25 = r('25', 'Entering Players', [
  c('25.1', 'An entering player is a player who is allowed to return to the court after having previously been in the queue area.'),
  c('25.2', 'An entering player must step into the playing area immediately over the back line. Once they make contact with the ground within the boundary lines with both feet, they immediately become a live player. If an entering player is deemed to delay their entry they are immediately called out.'),
  c('25.3', 'An entering player cannot be hit out or make any plays.'),
  c('25.4', "An entering player must not pick up any balls. If a player picks up a ball before entering, their team forfeits that ball and the player is immediately called out."),
]);

const rule26 = r('26', 'Out of Bounds', [
  c('26.1', 'If any part of a player, including hair or on any part of their clothing, touches a boundary line, they shall be considered out of bounds.'),
  c('26.2', 'If any part of a player, including hair or on any part of their clothing, touches a surface, dead object that is not a ball, an active player, or a ball retriever outside the boundary lines, they shall be considered out of bounds.'),
  c('26.3', "If any part of a player, including hair or on any part of their clothing, touches the opposing team's fair territory they shall be considered out of bounds."),
  c('26.4', 'If any part of a player, including hair or on any part of their clothing, touches the neutral zone line adjacent to the opponents fair territory, they shall be considered out of bounds.'),
  c('26.5', 'Any player who is considered out of bounds is deemed out immediately.'),
  c('26.6', "If a player steps out of bounds while making a play, it is up to the match officials' discretion if that play was completed before they stepped out of bounds."),
  c('26.7', 'A player cannot use a ball, ball retriever or active player that is out of bounds to prevent themselves from being out of bounds. Any such player will be called out.'),
]);

const rule27 = r('27', 'Neutral Zone', [
  c('27.1', 'No physical contact can be made between players. Any physical contact results in the player initiating the contact to be deemed out. A player can be penalized further, should a match official deem the action deliberate or dangerous.'),
]);

const rule28 = r('28', 'Sacrifice Play', [
  c('28.1', "A player may attempt to attack while fully airborne. They are permitted to cross the opponent team's neutral zone line to make an attempt to hit a player out."),
  c('28.2', 'No physical contact can be made between players. The player attempting the airborne attack must ensure that there is enough space between them and opposing team members. Any physical contact is considered a failed attempt.'),
  c('28.3', 'If a match official determines that a player deliberately causes or risks contact during an airborne attack, the offending player will receive a yellow card and any player not penalized can return into their own fair territory.'),
  c('28.4', 'Only 1 player per team may attempt a sacrifice play at a time, otherwise all players of the offending team attempting a sacrifice play will be called out.'),
  c('28.5', 'Failed Attempt', [
    c('28.5.1', 'If a player attempting an airborne attack does not hit a player with any ball they were in control of when becoming airborne, they are deemed out.'),
    c('28.5.2', "If the player does not release all balls before they touch the opponent's fair territory, they are deemed out and any throw is not eligible to get a player out."),
  ]),
  c('28.6', 'Successful Attempt', [
    c('28.6.1', "If a player attempting an airborne attack successfully hits an opposing live player, they may return to the neutral zone without stepping out of bounds in the opponent's territory. They must do so as quickly as possible, or they may receive a warning or yellow card."),
  ]),
  c('28.7', 'The player may not make any valid plays until they reach the neutral zone or their own fair territory.'),
  c('28.8', 'The player may not pick up any balls until they reach the neutral zone. If a player picks up a ball, they are deemed out and any picked up balls are forfeited to the opposing team.'),
  c('28.9', "A sacrifice play begins when an airborne player crosses the area above the opponent's neutral zone line."),
  c('28.10', "A sacrifice play is complete when the player has left the opponent's fair territory, by either stepping outside the playing court after a failed attempt, or by returning to the neutral zone with both feet after a successful attempt."),
]);

const rule29 = r('29', 'Simultaneous Play', [
  c('29.1', 'Simultaneous play occurs when two or more plays happen at the same time and the match officials cannot determine which play was completed first.'),
  c('29.2', 'Should there be simultaneous play, all results of the plays are resolved simultaneously.'),
  c('29.3', 'Should simultaneous play result in all active players being deemed out, the set results in a draw.'),
]);

const rule30 = r('30', 'Ball Stealing', [
  c('30.1', "A live player may pick any balls that are within reach without regard to the ball's position on the court."),
  c('30.2', 'A player may only pick up balls that are not in possession of a player of the opposing team, with exception of the center ball during the opening rush.'),
  c('30.3', 'Physically removing a ball from the control of an opponent will result in a yellow card.'),
]);

const rule31 = r('31', 'Ball Retrievers', [
  c('31.1', 'Ball retrievers may not touch any boundary line.'),
  c('31.2', 'Ball retrievers may not touch any surface, ball, or affect a live player or live ball within the court boundaries.'),
  c('31.3', 'Ball retrievers may retrieve any ball that is outside the boundary lines.'),
  c('31.4', "Ball retrievers may not retrieve any ball that has crossed the center line away from their team's half of the court. If not marked, the center line extends the full width of the playing court."),
  c('31.5', 'Ball retrievers may pass balls to live players or other ball retrievers.'),
  c('31.6', 'Ball retrievers may place balls within court boundaries.'),
  c('31.7', 'Ball retrievers may not cause balls to transfer to the opposing team.'),
  c('31.8', "Ball retrievers may not make contact with an opponent's team member or match official."),
  c('31.9', 'Ball retrievers may be changed between each set.'),
  c('31.10', 'Ball retrievers violating rule 31.1 ff. will receive a verbal warning or retriever yellow card at the discretion of the match official.'),
  c('31.11', "Should a ball retriever's violation of the rules result in a change of ball distribution between teams, the referee may instead of, or in addition to, the penalty transfer up to 5 balls to the non-offending team. The choice of how many balls they receive is up to the non-offending team."),
  c('31.12', 'Ball retrievers must put balls into play as soon as possible.'),
  c('31.13', "When returning a ball to play, a ball retriever may either toss a ball to any active player behind the team's attack line or place the ball on court behind the team's attack line."),
  c('31.14', 'Any ball that does not fully cross behind the attack line shall not be used for blocking or throwing until it has fully crossed behind the attack line.'),
]);

const rule32 = r('32', 'Penalties', [
  c('32.1', 'If a player receives a penalty that sends them to the penalty area, they must remain there for the duration of the penalty.'),
  c('32.2', 'A player that has been sent to the penalty area is still an active player and the team will not be able to substitute them for the duration of the penalty, except due to injury. The substituted player must take the injured player\'s position in the penalty area. Both players cannot be substituted until the penalty is completed.'),
  c('32.3', 'Once a penalty is completed, the player will reenter play in the last position of the queue. If a penalty completes between sets the player will be allowed to fully participate in the set.'),
  c('32.4', 'Match officials may issue a verbal warning to match participants at their discretion if an offense does not warrant an immediate penalty.'),
  c('32.5', 'When a team or its participants receives 4 yellow cards in a match, they will forfeit the match. For this purpose 1 red card equates to 2 yellow cards.'),
  c('32.6', 'Match officials may issue warnings and penalties for unsporting conduct before the start of a match, from the moment teams have entered the playing area.'),
]);

const rule33 = r('33', 'Blue Card', [
  c('33.1', 'When a player receives a blue card, they will be sent to the penalty area for the remainder of the current set and the entirety of the following set.'),
  c('33.2', 'When a player receives a blue card, the team will play short-handed for the remainder of the current set, if the blue card is given during a set, and the entirety of the following set.'),
  c('33.3', 'A player may only receive a blue card twice within a match. If any further offense warrants an additional blue card penalty, it will be given as a yellow card instead.'),
  c('33.4', 'If a team is not able to field at least 1 player due to a blue card penalty, the team will immediately forfeit the current set, if the blue cards are given during a set, and the following set and the penalty is considered served. Should both teams be unable to field at least 1 player, the set(s) will be considered drawn.'),
]);

const rule34 = r('34', 'Yellow Card', [
  c('34.1', 'Player Yellow Card', [
    c('34.1.1', 'When a player receives a yellow card, they will be sent to the penalty area immediately and have to remain there for a period of 5 minutes of match time.'),
    c('34.1.2', 'A player may only receive a yellow card once within a match. If any further offense warrants an additional yellow card penalty, it will be given as a red card instead.'),
  ]),
  c('34.2', 'Retriever Yellow Card', [
    c('34.2.1', "When a non-player retriever receives a yellow card, they will be sent out of the playing area for 5 minutes of match time. Additionally, a player has to enter the penalty area for 5 minutes of match time. It is up to the team's discretion to determine which player should enter the penalty area and it may change the player between sets."),
    c('34.2.2', 'When a player retriever receives a yellow card, it will be handled as if they received a player yellow card. An active player must substitute for the offending player.'),
  ]),
  c('34.3', 'Team Yellow Card', [
    c('34.3.1', 'When a team receives a yellow card during a set, they will forfeit the current set.'),
    c('34.3.2', 'When a team receives a yellow card between sets or after the match has finished but before the match officials have signed the match sheet, they will forfeit a full set. Should this result in a match to be drawn, all rules pertaining to draws will come into effect.'),
    c('34.3.3', 'A team may only receive a team yellow card once within a match. If any further offense warrants an additional yellow card penalty, it will be given as a red card instead.'),
  ]),
]);

const rule35 = r('35', 'Red Card', [
  c('35.1', 'Player Red Card', [
    c('35.1.1', 'When a player receives a red card, they are immediately ejected from the match.'),
    c('35.1.2', 'When a player receives a red card, the team will play short-handed for the remainder of the match.'),
  ]),
  c('35.2', 'Team Red Card', [
    c('35.2.1', 'When a team receives a red card, it forfeits the match.'),
  ]),
]);

const rule36 = r('36', 'Code of Conduct', [
  c('36.1', 'All participants must abide by the rules and regulations honestly and with integrity. Any violation of the rules will result in an out of a live player, or, if warranted, a warning or penalty.'),
  c('36.2', 'In addition to any penalties stated in the rules, players and team officials may also receive a penalty following aggressive, abusive, unsporting or other unacceptable use of profanity or unsavory language at the discretion of the match officials. This can include, but is not limited to', [
    c('(1)', 'Fighting, attempting to assault another participant, or any uninvited physical contact;'),
    c('(2)', "Discriminatory comments on a person's sex, gender, sexual orientation, race, religion, creed, ethnicity, age, or any form of discrimination;"),
    c('(3)', 'Taunting, and calling opponents out;'),
    c('(4)', 'Throwing a ball at an opposing player despite having been clearly rendered out;'),
    c('(5)', "Intentionally inflicting pain or throwing a ball excessively hard at close distance at another player's face;"),
    c('(6)', 'Excessive use of foul language;'),
    c('(7)', 'Cheating;'),
    c('(8)', 'Causing distraction to players on the court;'),
    c('(9)', 'Mistreating equipment such as kicking or spiking the ball;'),
    c('(10)', 'Causing unreasonable delay to the match;'),
    c('(11)', 'Performing actions to gain unfair advantage;'),
    c('(12)', 'Showing poor sportsmanship.'),
  ]),
]);

const rule37 = r('37', 'Challenges', [
  c('37.1', 'A team can challenge the incorrect application of a rule by the match officials twice per match.'),
  c('37.2', 'The challenge can only be made by a team leader or team captain.'),
  c('37.3', 'A challenge must be made immediately following an incorrect application of a rule during a set, or otherwise before the start of the next set.'),
  c('37.4', 'A challenge can only be made, based on a misapplication of a rule by the match officials that is not up to the judgment or discretion of the match official. This includes the participation of ineligible or ejected players during a set.'),
  c('37.5', 'Any challenge made for other reasons will automatically be unsuccessful.'),
  c('37.6', 'If a challenge has been made, the match officials will suspend play immediately.'),
  c('37.7', 'The match officials will attempt to resolve the challenge before play can resume.'),
  c('37.8', 'Match officials may request assistance from other officials to resolve a challenge.'),
]);

const rule38 = r('38', 'Player Injury', [
  c('38.1', 'Should a player become injured and requires immediate attention, the match officials shall suspend play immediately.'),
  c('38.2', 'If an injured player is unable to continue play, a team is allowed to substitute them for a player on the roster.'),
  c('38.3', "The substituted player may enter the game at the end of the queue."),
  c('38.4', 'If the substituted player was a live player, the first player in the queue is allowed to enter the court immediately.'),
  c('38.5', 'If a player is replaced during a game, they may not participate in the match as an active player until the following set after the current set has concluded.'),
  c('38.6', 'Match officials may substitute players at their discretion, if they determine that the player presents an unreasonable risk to themselves or others.'),
  c('38.7', 'For safety reasons, any treatment of injured players should be done outside the playing court.'),
]);

const rule39 = r('39', 'Blood Injury', [
  c('39.1', 'If a participant is found bleeding or discovered to have blood on their uniform, match officials shall suspend play immediately to allow treatment.'),
  c('39.2', 'A player will not be allowed to participate any further in the set current and may only return to be an active player once treatment has been administered and there is no blood visible on the player or their clothing.'),
]);

const rule40 = r('40', 'Head Referees', [
  c('40.1', 'The head referees are the officials located on either side of the center line. There will be a maximum of 2 head referees in the game, one of the referees shall be deemed in charge. The head referee in charge is positioned on the side of the penalty areas.'),
  c('40.2', 'The head referees are responsible for checking all the equipment before the game.'),
  c('40.3', 'The head referees are responsible for clarifying all the calls if needed.'),
  c('40.4', 'The head referees are in charge of all officials on their court and are the final decision maker on all matters covered by these rules and regulations.'),
  c('40.5', 'The head referees are responsible for indicating the start of a set with a loud whistle blast.'),
  c('40.6', 'The head referees are responsible to ensure the ball is activated.'),
  c('40.7', 'The head referees are responsible for the count down on the advantage side.'),
  c('40.8', 'The head referees enforce the rules of the game by whistle and action.'),
  c('40.9', 'The head referees are allowed to stop the match and set clocks.'),
  c('40.10', 'The head referees may issue warnings to any player that does not follow the rules as described.'),
  c('40.11', 'Should the head referees have a differing opinion on a call, they must come to a joint decision after consulting with each other and other match officials. Should they not manage to reach a joint decision, the head referee in charge shall make the final call.'),
  c('40.12', 'Head referees may take on or delegate responsibilities to other officials, such as the ones of a scorekeeper or timekeeper, should these roles not be filled by dedicated match officials.'),
  c('40.13', 'Head referees may change their calls, but must do so before the next period of inactivity or coordinated throwing attempt by either team during a set, or before the start of the next set otherwise.'),
]);

const rule41 = r('41', 'Line Referees', [
  c('41.1', 'Line referees are officials positioned around the boundaries of the court.'),
  c('41.2', 'The line referee is responsible to ensure all players are at the valid position before the start of the set.'),
  c('41.3', 'The line referee is responsible for ensuring the balls are activated.'),
  c('41.4', 'The line referee should make sure all opening rush is valid in every set.'),
  c('41.5', 'The line referee enforces the rules of the game by action only.'),
]);

const rule42 = r('42', 'Scorekeeper', [
  c('42.1', 'The scorekeeper is the official that sits on the referee booth positioned next to the timekeeper.'),
  c('42.2', 'The scorekeeper is responsible for keeping accurate match scoring by filling out the score sheet as the match progresses.'),
  c('42.3', 'The scorekeeper is responsible for recording all the live players when a time-out is called and ensuring the same players are played when the game resumes.'),
]);

const rule43 = r('43', 'Timekeeper', [
  c('43.1', 'The timekeeper is the official that sits in the referee booth positioned behind the match clock aside to the scoreboard.'),
  c('43.2', 'The timekeeper is responsible for pausing the timer when announced by the referee.'),
  c('43.3', 'The timekeeper should indicate the end of the set, half or match time with a blow of the whistle, if the venue is not equipped with an automated signaling system.'),
]);

const rule44 = r('44', 'Officials Interference', [
  c('44.1', 'Match officials shall avoid interfering with play or balls in flight whenever possible.'),
  c('44.2', 'Match officials may prevent a ball from leaving an open court. In which case the ball should be moved in its natural direction as if it had bounced off the official, or returned to center court if the point of exit is unclear.'),
]);

const rule45 = r('45', 'Suspending Play', [
  c('45.1', 'Any match official can suspend play at any time during the match, if they deem it necessary.'),
  c('45.2', 'Match officials should avoid suspending play if there is action on the court that is independent from the reason for suspending play.'),
  c('45.3', 'When suspending play, the official will blow the whistle and raise their hand and step onto court, if it can be done safely, to indicate play is suspended.'),
]);

const rule46 = r('46', 'Timeout', [
  c('46.1', 'Only the head referees can call a timeout.'),
  c('46.2', 'When indicating a timeout, head referees should blow the whistle while signaling a T with their arms and stepping onto the court.'),
  c('46.3', 'Ten seconds before the end of the timeout, a head referee shall blow the whistle for approximately 1 second.'),
]);

const reglamentoCloth: Reglamento = {
  formato: 'cloth',
  tituloDocumento: 'WDBF Cloth Dodgeball Rules 2026',
  fuente: 'World Dodgeball Federation (WDBF)',
  partes: [
    { numero: 'Part 1', titulo: 'Definitions', secciones: [{ reglas: [definiciones] }] },
    { numero: 'Part 2', titulo: 'Facilities and Equipment', secciones: [{ reglas: [rule1, rule2, rule3] }] },
    { numero: 'Part 3', titulo: 'Participants', secciones: [{ reglas: [rule4, rule5, rule6, rule7] }] },
    { numero: 'Part 4', titulo: 'Playing Formats, Timing, and Scoring', secciones: [{ reglas: [rule8, rule9, rule10, rule11] }] },
    {
      numero: 'Part 5',
      titulo: 'The Game',
      secciones: [
        { titulo: 'Section 1: Opening Rush', reglas: [rule12, rule13, rule14] },
        { titulo: 'Section 2: Throwing', reglas: [rule15, rule16, rule17, rule18, rule19] },
        { titulo: 'Section 3: Blocking', reglas: [rule20, rule21] },
        { titulo: 'Section 7: Catching', reglas: [rule22] },
        { titulo: 'Section 4: Eliminated Players', reglas: [rule23, rule24, rule25] },
        { titulo: 'Section 5: Boundaries', reglas: [rule26, rule27, rule28] },
        { titulo: 'Section 6: Simultaneous Play', reglas: [rule29] },
        { titulo: 'Section 7: Ball Retrieving', reglas: [rule30, rule31] },
        { titulo: 'Section 8: Violations and Penalties', reglas: [rule32, rule33, rule34, rule35, rule36] },
        { titulo: 'Section 9: Challenges', reglas: [rule37] },
        { titulo: 'Section 10: Injuries', reglas: [rule38, rule39] },
      ],
    },
    {
      numero: 'Part 6',
      titulo: 'Officials',
      secciones: [
        { titulo: 'Section 1: Match Officials', reglas: [rule40, rule41, rule42, rule43, rule44] },
        { titulo: 'Section 2: Referee Procedures and Signals', reglas: [rule45, rule46] },
      ],
    },
    {
      numero: 'Part 7',
      titulo: 'Diagrams',
      secciones: [
        {
          reglas: [
            r('', 'Diagram 1, 2 y 3: Cancha combinada, cancha Cloth y cancha Foam', [
              c('', 'El documento original incluye diagramas de cancha (combinada, Cloth y Foam). Las medidas exactas de cada línea están detalladas en la Regla 1 (Playing Area) de este reglamento. Podés ver una recreación 3D de la cancha en la portada de Overtime.'),
            ]),
          ],
        },
      ],
    },
  ],
};

export default reglamentoCloth;
