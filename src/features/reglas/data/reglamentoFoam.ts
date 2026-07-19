import type { Reglamento, Regla, Clausula } from '../types';

// Transcripción del reglamento oficial "WDBF Foam Dodgeball Rules 2026" (World Dodgeball Federation).
// Texto verbatim en inglés (idioma original del documento oficial). La Regla 1 (Facilities) tenía una
// sección ("Zones and Areas") cuya numeración de sub-incisos quedó dañada por el diseño en columnas del
// PDF original; fue renumerada en orden lógico (1.3.x / 1.4.x) preservando el texto original intacto.

const c = (numero: string, texto: string, hijos?: Clausula[]): Clausula => ({ numero, texto, hijos });
const r = (numero: string, titulo: string, clausulas: Clausula[]): Regla => ({ numero, titulo, clausulas });

const definiciones = r('', 'Definitions', [
  c(
    '',
    'Definitions must be observable, binary, and non-interpretive wherever possible. If a referee must infer intent to apply a rule, that rule must include a warning → penalty ladder.'
  ),
  c('1', 'Half Clock. The Half Clock is the official match clock that tracks the remaining time in the current half of regulation play. The Half Clock starts on the Start Signal of the first Set of the half and stops only under the conditions listed in Rule 7.6.2.'),
  c('2', 'Set Clock. The Set Clock is the official clock that tracks the regular play duration of the current Set (up to three minutes). The Set Clock starts on the Start Signal for that Set and stops when the Set ends or when play is suspended under Rule 7.4.'),
  c('3', 'Start Signal. The Start Signal is the official signal given by a Head Referee to begin or resume play, including the start of a Set and any restart after a stoppage. The Start Signal may be a whistle, a visual signal, or both (see Rules 11.3.3 and 7.6.1).'),
  c('4', 'Live Ball. A thrown ball becomes Live upon release unless activation is required and not yet satisfied. Activation is required only for balls retrieved during the Opening Rush (Rule 13).'),
  c('5', 'Dead Ball. A Dead Ball is a ball that is not a Live Ball. A Dead Ball cannot render a player Out, cannot be caught for an Out, and does not count as a thrown Live Ball until it becomes a Live Ball again under these rules.'),
  c('6', 'Dead Object. A Dead Object is any person, surface, or object that is not part of active play. Dead Objects include, but are not limited to:', [
    c('a.', 'the Playing Surface, including the floor, walls, ceiling, and any fixed court surface or structure.'),
    c('b.', 'any court or venue equipment (benches, tables, barriers, stanchions, scoreboard stands, etc.).'),
    c('c.', 'any non-Active person, including Out Players, Exiting Players, Ball Retrievers, Match Officials, and team staff.'),
    c('d.', 'any object or area outside the Playing Area.'),
    c('e.', 'any Dead Ball. For avoidance of doubt, the Playing Surface is a Dead Object for purposes of Live Ball and Dead Ball status (Rule 16).'),
  ]),
  c('7', 'Active Player. A player on the roster who is participating in a set.'),
  c('8', 'Live Player. A Live Player is an Active Player that is not out.'),
  c('9', 'Out Player. An Out Player is an Active Player that has been rendered Out.'),
  c('10', 'Queue. The Queue is a designated, marked space located adjacent to each Team Bench for players awaiting entry or re-entry.'),
  c('11', 'Entering Player. An Entering Player is an Active Player that is in the process of re-entering play.'),
  c('12', 'Exiting Player. An Exiting Player is an Active Player that is rendered Out and in the process of returning to the Queue.'),
  c('13', 'Burden. Burden is the obligation placed on a team to make a valid attempt within a defined time limit, as determined by Rule 15.2.'),
  c('14', 'Possession. Burden Possession is attributed to a team for Burden determination when one of the following is true:', [
    c('a.', 'A Live Player on that team has Control of the ball.'),
    c('b.', "The ball is stationary inside the Boundary Lines on that team's side of the Center Line."),
    c('c.', "The ball is naturally stationary outside the Boundary Lines on that team's side of the Center Line, using the Center Line extended beyond the court boundaries."),
    c('d.', "The ball has exited the Playing Area from that team's half of the court, until retrieved or replaced. For avoidance of doubt, \"naturally stationary\" means the ball has landed on the Playing Surface naturally, not by being placed there by a player, ball retriever, or match official."),
  ]),
  c('15', 'Willful Manipulation. The intentional placement or movement of a ball for the primary purpose of transferring Burden to the opposing team without making a valid attempt to play the ball.'),
  c('16', 'Control. Control is established when a Live Player secures a ball with any part of their body, such that the player can intentionally retain, carry, and/or direct the ball without relying on contact with the Playing Surface, another object, or another player. A player may establish Control while airborne.'),
  c('17', 'Short-handed. Starting a set with less than 6 players on court.'),
  c('18', 'No-Blocking. No-Blocking is a phase of play in which the blocking rule (Rule 19) is suspended.'),
  c('19', 'Lull in Play. Lull in Play is a moment when no Live Balls are in flight and no player is actively engaged in throwing, blocking, or catching. Officials may delay a timing action to avoid interrupting an active play.'),
  c('20', 'Ball Reset. Ball Reset is the standardized procedure used to restart play during specific game states. Ball Reset is not a player re-entry mechanism and does not override re-entry rules tied to catches. During a Ball Reset:', [
    c('a.', "All balls are retrieved and evenly redistributed, with three (3) balls placed on each team's side of the court."),
    c('b.', 'No ball is placed at the center line.'),
    c('c.', 'Players must have at least one foot on the back line prior to the restart signal.'),
    c('d.', "Play resumes on the referee's signal."),
  ]),
]);

const estandaresInterpretacion = r('', 'Interpretation Standards', [
  c('1', 'Purpose. These Interpretation Standards exist to ensure rules are applied consistently across matches, venues, and officiating crews. When these Standards conflict with an interpretation or habit, these Standards control.'),
  c('2', 'Rule hierarchy. When resolving any situation, match officials must apply the following hierarchy in order:', [
    c('a.', 'Safety first. If continuing play creates an unreasonable safety risk, stop play.'),
    c('b.', 'Black letter rules. Apply the written rule as drafted.'),
    c('c.', 'Definitions control. If a term is defined, that definition governs.'),
    c('d.', 'Objective indicators over intent. Use observable actions and outcomes. Do not infer motive unless the rules explicitly require it.'),
  ]),
  c('3', 'Objective enforcement standard. When a rule requires judgment, match officials must use the most objective and observable standard available. If two interpretations are plausible, officials must choose the interpretation that:', [
    c('a.', 'is most consistent with the Definitions, and'),
    c('b.', 'preserves the flow of play, and'),
    c('c.', 'avoids awarding an advantage based on uncertainty.'),
  ]),
  c('4', '"Announceable" administration. When officials apply an administrative action that affects timing or Possession (example: pausing a count, resetting play, relocating balls, or restarting after stoppage), the official must announce the action using the simplest, most standardized language.'),
  c('5', 'Least-disruptive remedy. Officials must use the least disruptive remedy that corrects the problem and preserves fairness. Examples:', [
    c('a.', 'If a correction can be applied at the next lull, do that.'),
    c('b.', 'If play can continue without an unfair advantage, do not stop play.'),
    c('c.', 'If a stoppage is required, restart with the simplest, most standardized restart available in the rules.'),
  ]),
  c('6', 'Ambiguity and last-resort discretion. If a rule permits discretion or a situation is not explicitly addressed, officials may make a ruling only as a last resort. Any last-resort ruling must be:', [
    c('a.', 'consistent with the purpose of the rule section being applied,'),
    c('b.', 'consistent with similar situations, and'),
    c('c.', 'applied the same way to both teams for the remainder of the match.'),
  ]),
  c('7', 'Timing and delay standard. Officials may penalize delay only when the delay is clear, repeated, or materially disrupts match flow. Accidental delay, equipment issues, or normal player movement should not be penalized unless it becomes a pattern.'),
  c('8', 'Challenges. A challenge may be used only to correct a misapplication of a written rule. A challenge may not be used on judgment calls. Judgment calls include, but are not limited to:', [
    c('a.', 'whether a player was hit,'),
    c('b.', 'whether control was established,'),
    c('c.', 'whether contact was simultaneous,'),
    c('d.', 'whether an action was "intentional" unless the rule explicitly requires intent.'),
  ]),
  c('9', 'Consistency within a match. Once officials establish a standard for a recurring edge case (example: ball placement on stoppage, boundary interpretation on a specific floor, handling of marginal traps), they must apply that standard consistently for the remainder of the match.'),
  c('10', 'See Part 12 for Standard Calls and Signals.'),
]);

const rule1 = r('1', 'Facilities', [
  c('1.1', 'Playing Surface. The surface must be flat and horizontal. It must not present any danger to any participants of a match. It is not allowed to play on a rough or slippery surface.'),
  c('1.2', 'Dimensions. The Playing Court is a rectangle with dimensions of 18 meters in length by 9 meters in width, surrounded by free space, which is a minimum of 1 meter wide on all sides. The space above the Playing Court must be free from any obstructions. This area shall be a minimum of 4 meters in height from the Playing Surface.'),
  c('1.3', 'Zones and Areas.', [
    c('1.3.1', 'Playing Area. The Playing Area is a flat rectangular area that includes the Playing Court, free spaces, both Queues, Penalty Areas, and Team Benches. It should be enclosed by barriers or netting on all four sides to prevent balls from exiting.'),
    c('1.3.2', "Playing Court. The Playing Court is the area enclosed by the boundary lines and includes each team's Fair Territory."),
    c('1.3.3', "Fair Territory. A team's Fair Territory is the area from the back line to the outside edge of, not including, the Center Line on each court, enclosed by the side lines.", [
      c('1.3.3.1', "Opponent Territory. The opponent's territory is the portion of the Playing Court on the opposite side of the Center Line from a team's Fair Territory (the opponent's Fair Territory)."),
    ]),
    c('1.3.4', 'Queue. Each Queue must be clearly marked with boundary lines. One Queue shall be located on each side of the Center Line, with both Queues positioned on the same side of the court. The Queue shall be positioned a minimum of 1 meter from the sideline of the court. The rear edge of the Queue shall align with the rear edge of the back line.'),
    c('1.3.5', 'Penalty Area. The Penalty Area is a designated area extending from the Queue towards the direction of the Center Line, where players serve time for infractions. It shall be 1 meter in length by 1 meter in width, and clearly marked with boundary lines. The front edge of the Penalty Area shall align with the front edge of the Team Bench.'),
    c('1.3.6', 'Team Bench. The Team Bench must be clearly marked with boundary lines. It shall be positioned a minimum of 4 meters from the Center Line, extending to the rear edge of the back line and sharing a side line with the Queue and Penalty Area.'),
  ]),
  c('1.4', 'Lines on the Court.', [
    c('1.4.1', 'All court lines shall be 5 cm wide and of a uniform color clearly contrasting with the Playing Surface. When feasible, the Activation Line shall be a distinct color from Boundary Lines to aid officiating and player clarity (see Diagram 1). Should the court be set up to facilitate both playing formats, the neutral zone and attack lines for the Cloth playing format must use a different color than the boundary lines (see Diagram 1).'),
    c('1.4.2', 'Boundary Lines. The boundary lines consist of two side lines and two back lines that mark the Playing Court. Both side lines and back lines are drawn inside the dimensions of the Playing Court.', [
      c('1.4.2.1', "For Women's competitions, there shall be a back line whose rear edge is drawn 1 meter away from the rear edge of the back lines, toward the Center Line."),
    ]),
    c('1.4.3', 'Center Line. The axis of the Center Line divides the Playing Court into two equal courts.', [
      c('1.4.3.1', 'If not marked, the Center Line extends the full width of the Playing Area a ball may roll during play.'),
      c('1.4.3.2', 'Line Markings. Line markings shall be present on the Center Line to indicate where balls can be placed for the opening rush. Line Markings must be positioned within 3 meters from each boundary side line.'),
    ]),
    c('1.4.4', "Activation Line. An Activation Line is drawn 3 meters away from the edge of the Center Line in each team's Fair Territory."),
  ]),
]);

const rule2 = r('2', 'Equipment', [
  c('2.1', 'Match Balls', [
    c('2.1.1', 'Official World Dodgeball Federation (WDBF) competitions must be played with balls approved by the WDBF. They must have the same standards regarding circumference, weight, pressure, type, color, etc.'),
    c('2.1.2', 'Dodgeball (Foam) is played with 6 balls.'),
    c('2.1.3', 'All balls shall be made out of polyurethane (PU) coated foam.'),
    c('2.1.4', 'The ball shall be spherical in shape, measuring 17.8 cm (7 in) in diameter, and weighing 134-146 g (4.7-5.1 oz).'),
    c('2.1.5', 'Ball Integrity.', [
      c('2.1.5.1', 'A player must not hold, compress, pinch, or distort a ball in a way that could damage the ball.'),
      c('2.1.5.2', "A player must not distort a ball in a way that would materially alter its normal flight pattern when thrown."),
      c('2.1.5.3', 'Enforcement.', [
        c('2.1.5.3.1', 'First observed violation by a team in a Match: verbal warning.'),
        c('2.1.5.3.2', 'Second observed violation by the same team in a Match: Team Yellow Card.'),
        c('2.1.5.3.3', 'Further violations: additional Team Yellow Cards may be issued.'),
      ]),
    ]),
  ]),
  c('2.2', 'Scoring and Timing Devices.', [
    c('2.2.1', 'There is one official timing device for the running half time on one side of the court.'),
    c('2.2.2', 'There is one official set timing device for the running set on the same side of the court.'),
    c('2.2.3', 'There is one official scoring device on the same side of the court as the official timing device.'),
    c('2.2.4', 'Timing and/or scoring devices may be combined into a single device.'),
  ]),
  c('2.3', 'Uniforms.', [
    c('2.3.1', 'All players on a team must wear uniforms identical in color and design, but may vary in cut and length, except when a player is forced to change uniforms due to damage or blood injury.'),
    c('2.3.2', 'Each player must be identified by a unique number (0-99) on the back and front of the uniform. The number on the back must be on the top part of the uniform.'),
    c('2.3.3', 'Team captains of a team must be clearly identifiable.'),
    c('2.3.4', 'Ball retrievers may not wear a uniform similar in nature to the team in which they represent.'),
    c('2.3.5', 'Team leaders must be clearly identified and not mistaken for regular players.'),
    c('2.3.6', 'Match officials must be clearly identified and not mistaken for regular players.'),
  ]),
  c('2.4', 'Player Equipment.', [
    c('2.4.1', 'No player will be allowed to play, should a Match Official determine that their equipment poses a risk to the safety of other players or that the use thereof changes the fundamental nature of the game or give the player any other advantage.'),
    c('2.4.2', 'Headgear. Headbands, bandanas and other thin, reasonable garments and protective helmets are the only permitted headgear for players.', [
      c('2.4.2.1', "For the purposes of the game, headgear becomes a part of a player's body and is subject to hits and outs."),
    ]),
    c('2.4.3', 'Casts and Prostheses. Prostheses may be worn. All casts, braces and splints with exposed hard surfaces must be padded.'),
    c('2.4.4', 'Gloves. Gloves must not be worn except when medically necessary.', [
      c('2.4.4.1', 'Any medically necessary gloves must not enhance the ability of a player in the game.'),
      c('2.4.4.2', 'Supporting medical documentation must be provided to tournament administrators prior to participation.'),
    ]),
    c('2.4.5', 'Jewelry. Exposed jewelry, judged as dangerous by the Match Officials, must be removed and may not be worn during the match.', [
      c('2.4.5.1', "Any jewelry that can't be removed must be taped and approved by a Match Official."),
    ]),
    c('2.4.6', 'Goggles. Goggles or sporting glasses may be worn and must be secured with head straps. If goggles or sporting glasses cannot be secured with head straps, they may only be worn after approval by a Match Official.'),
    c('2.4.7', 'Shoes. Shoes, made of canvas, leather or similar material with a rubber non-marking sole, must be worn at all times.', [
      c('2.4.7.1', 'Shoes judged as unsafe by the Match Officials are prohibited.'),
    ]),
  ]),
  c('2.5', 'Other Equipment and Substances. Any other equipment may only be used after approval by the Match Officials.', [
    c('2.5.1', "Substances applied to the exterior of the team uniform or onto the skin of a player which enhances a player's ability to throw or catch a ball must not be used. This does not apply for commercially available dry or liquid chalk."),
    c('2.5.2', "Substances applied to a player's skin for medical reasons must be covered by a dressing."),
    c('2.5.3', 'Substances applied to aid a player injury are allowed to be applied, and must be covered by a dressing.'),
  ]),
]);

const rule3 = r('3', 'Players', [
  c('3.1', 'A Team may have a minimum of 6 players and no more than 12 players rostered at the start of each match.'),
  c('3.2', "6 Active Players per team participate in a set. These 6 players must remain within the confined areas of their Fair Territory, Queue, or Penalty Area."),
  c('3.3', 'Any player from the team roster not active at the start of a set must remain within the Team Bench.'),
]);

const rule4 = r('4', 'Ball Retrievers', [
  c('4.1', 'A Team may have up to 3 designated Ball Retrievers at the start of each set.'),
  c('4.2', 'Any player not active at the start of a set may be designated as a Ball Retriever.'),
  c('4.3', "Ball Retrievers may enter any of the designated areas within the Playing Area outside of the Playing Court to retrieve a ball up to the Center Line of their respective team's side during a set."),
  c('4.4', 'Ball Retrievers may only leave the Playing Area during a set to retrieve a ball(s).'),
  c('4.5', 'Ball retrievers may not touch any boundary line.'),
  c('4.6', 'Ball retrievers may not touch any surface, ball, or affect a Live Player within the court boundaries.'),
  c('4.7', 'Ball retrievers may retrieve any ball that is completely outside the boundary lines. Balls that are hovering over boundary lines of the court (even if not touching the lines) are off limits.'),
  c('4.8', "Ball retrievers may not retrieve any ball that has crossed the Center Line away from their team's half of the court."),
  c('4.9', 'Ball retrievers may pass balls to Live Players or other ball retrievers.'),
  c('4.10', 'Ball retrievers may place balls within court boundaries without Willful Manipulation (Rule 15.7).'),
  c('4.11', 'Ball retrievers may not make intentional contact with an opposition retriever or Match Official or Live player.'),
  c('4.12', 'Ball retrievers may be changed during the reset between each set.'),
  c('4.13', 'Ball retrievers violating these rules will', [
    c('4.13.1', 'Receive a verbal warning on the first observed violation in a Match.'),
    c('4.13.2', 'Be relieved of retriever duties for the remainder of the Match for any further violations by the same retriever.'),
  ]),
]);

const rule5 = r('5', 'Team Leaders', [
  c('5.1', 'A Team may have no more than two designated Leaders (Coaches, Assistant Coaches, or Managers) within the Playing Area during a match.'),
  c('5.2', "Team Leaders may reasonably move about their Fair Territory between their team's Activation Line and back line, the equivalent length of the Team Bench, to provide the Head Referees space to operate. Team Leaders may cross the Activation Line in order to respectfully engage with an official (for a query or challenge)."),
  c('5.3', 'Team Leaders may not enter the court or officiating area without justification from the official except during timeouts and halves.'),
]);

const rule6 = r('6', 'Officials', [
  c('6.1', 'Match Officials.', [
    c('6.1.1', 'The Officials monitor the game and enforce the rules of the game.'),
    c('6.1.2', 'The Officials are the final authority and arbiter of the rules during a match.'),
    c('6.1.3', 'Any Match Official can stop play at any time during the match, if they deem it necessary.'),
    c('6.1.4', 'An official should avoid stopping play if there is action on the court that is independent from the reason for stopping play.'),
    c('6.1.5', 'An official may prevent a ball from leaving an open court. In which case the ball should be moved in its natural direction as if it had bounced off the official, or returned to center court if the point of exit is unclear.'),
    c('6.1.6', 'When stopping play, the official will blow the whistle and raise their hand and step onto court, if it can be done safely, to indicate play is stopped.'),
  ]),
  c('6.2', 'Head Referees.', [
    c('6.2.1', 'Positions and Number. Head Referees are the Match Officials positioned on either side of the Center Line. A match may have one (1) or two (2) Head Referees.'),
    c('6.2.2', 'Equipment and court readiness. Head Referees are responsible for confirming court readiness before play, including ball count, ball condition, court markings, and any required safety equipment.'),
    c('6.2.3', 'Primary authority and final decisions. Head Referees are responsible for clarifying and confirming calls when needed. The Head Referee is the final decision maker on matters covered by these rules.'),
    c('6.2.4', 'Start and restart authority. Head Referees control the start and resumption of play, including the start signal for each Set and the resumption signal after stoppages.'),
    c('6.2.5', 'Ball activation and Opening Rush administration. Head Referees are responsible for administering Opening Rush procedures and confirming ball activation requirements are enforced consistently.'),
    c('6.2.6', 'Burden administration. Head Referees are responsible for indicating Burden, managing Burden countdowns, and applying any Burden pause permitted by the Burden rules.'),
    c('6.2.7', 'Timekeeping and scorekeeping oversight. Head Referees may act as or supervise the Timekeeper and Scorekeeper where staffing requires.'),
    c('6.2.8', 'Warnings and penalties. Head Referees may issue verbal warnings and penalties as defined by these rules.'),
  ]),
  c('6.3', 'Corner Referees.', [
    c('6.3.1', 'Position. Corner Referees are Match Officials positioned around the boundaries of the court to assist with boundary, line, and ball-status calls.'),
    c('6.3.2', 'Responsibilities. Corner Referees support the Head Referees by monitoring:', [
      c('6.3.2.1', 'Boundary and out-of-bounds violations.'),
      c('6.3.2.2', 'Player positioning prior to the start signal.'),
      c('6.3.2.3', 'Ball status events near the boundary (live/dead determination).'),
      c('6.3.2.4', 'Player entry and exit compliance near the Queue and Back Line.'),
    ]),
    c('6.3.3', 'Authority limits. Corner Referees do not administer the start signal, ball activation, Burden countdown, or challenge determinations. Corner Referees may provide information and recommendations to the Head Referees.'),
    c('6.3.4', 'Requesting stoppage for safety or correction. A Corner Referee may request play be stopped to address a safety issue or a clear administrative correction. Only a Head Referee stops play unless immediate safety requires otherwise.'),
  ]),
  c('6.4', 'Scorekeeper.', [
    c('6.4.1', "Position. The Scorekeeper is stationed at the officials' table / referee booth."),
    c('6.4.2', 'Responsibilities. The Scorekeeper records Set results, Match score, cards, and other required match sheet items as the match progresses.'),
    c('6.4.3', 'Player verification during timeout. When a timeout or official stoppage occurs, the Scorekeeper may assist in verifying the current Live Players and ensuring consistent resumption where required by the rules.'),
  ]),
  c('6.5', 'Timekeeper.', [
    c('6.5.1', "Position. The Timekeeper is stationed at the officials' table / referee booth with visibility to the match clock and scoreboard."),
    c('6.5.2', 'Responsibilities. The Timekeeper starts, stops, and pauses the match clock only when directed by a Head Referee or when required by the timing rules.'),
    c('6.5.3', 'End-of-period signal. If the venue is not equipped with an automated signaling system, the Timekeeper should indicate the end of a Set timer, half, or Match time using an audible signal (including a whistle) as directed by a Head Referee.'),
  ]),
]);

const rule7 = r('7', 'Timing', [
  c('7.1', 'Match. A Match consists of two (2) halves of regulation play. Each half is twenty (20) minutes in duration.'),
  c('7.2', 'Set. A Match consists of an indeterminate number of Sets. Each set consists of up to three (3) minutes of regular play.'),
  c('7.3', 'Halftime. Halftime is a maximum of five (5) minutes.'),
  c('7.4', 'Timeouts and Suspended Play', [
    c('7.4.1', 'Only the Head Referees can call a timeout.'),
    c('7.4.2', 'Only the Team Leaders may request a timeout for their team.'),
    c('7.4.3', 'Each team is permitted one (1) timeout per half.'),
    c('7.4.4', 'A timeout is sixty (60) seconds.'),
    c('7.4.5', 'A timeout may be requested at any time, but the moment the timeout takes effect is determined by the Head Referee.'),
    c('7.4.6', 'When indicating a timeout, head referees should blow the whistle while signaling a T with their hands and stepping onto the court.'),
    c('7.4.7', 'Ten seconds before the end of the timeout, a head referee shall blow the whistle for approximately 1 second.'),
    c('7.4.8', 'During a timeout, play is suspended and the half clock is stopped. All balls not in Control remain at their location at the moment play is suspended. If ball location is unclear, the Head Referee determines the placement.'),
    c('7.4.9', 'Head Referees may suspend play at any time for injury, safety, equipment issues, or match administration. During official suspended play, all clocks are stopped and participants must remain in their designated areas unless directed otherwise by officials.'),
    c('7.4.10', 'Resuming play. When play resumes after an official stoppage, all players must begin with at least one foot on the Back Line. False starts are not assessed on the resumption itself. However, willful disruption or delay may be penalized under unsportsmanlike conduct and delay enforcement rules.'),
  ]),
  c('7.5', 'Expiration During Live Play.', [
    c('7.5.1', 'If the Half Clock or Set Clock expires while a Live Ball is in flight, play does not stop immediately. The current live sequence is allowed to complete as follows:', [
      c('7.5.1.1', 'Release controls. A ball is considered "thrown" at the moment it leaves the throwing player\'s hand (Rule 14.3).'),
      c('7.5.1.2', 'Live balls stay live. Any ball thrown before the clock reaches 0:00 remains a Live Ball and may complete its natural sequence.', [
        c('7.5.1.2.1', 'Multiple balls. If more than one ball was thrown before 0:00, all such balls remain Live and the sequence continues until all of them become Dead and their outcomes are resolved.'),
      ]),
      c('7.5.1.3', 'When the sequence ends. The sequence ends when all Live Balls thrown before 0:00 become Dead, and any resulting catches, outs, and re-entries are fully resolved under the normal rules.'),
      c('7.5.1.4', 'No new throws. After 0:00, no player may initiate a new throw. Any ball released after 0:00 is an invalid attempt and is immediately ruled Dead.'),
      c('7.5.1.5', 'Transition after completion. Once the sequence is complete, Match Officials shall apply the applicable timing outcome. End of half procedures, or No-Blocking initiation for an undecided timed set, as applicable.'),
    ]),
  ]),
  c('7.6', 'Half clock and set interactions.', [
    c('7.6.1', 'Half clock starts. The half clock starts on the start signal of the first Set of the half.'),
    c('7.6.2', 'Half clock stops. The half clock is stopped only when:', [
      c('7.6.2.1', 'An official timeout is granted (Rule 7.4).'),
      c('7.6.2.2', 'Play is suspended by officials for injury, safety, or match administration.'),
      c('7.6.2.3', 'A Set ends with one (1) minute or less remaining on the half clock, as described in Rule 7.6.3.'),
    ]),
    c('7.6.3', 'Last-minute pause between sets. If a Set ends when the half clock shows one minute (1:00) or less remaining, the half clock shall be paused at the moment the Set ends. The half clock resumes on the start signal of the next Set.'),
    c('7.6.4', 'Five-second No-Blocking final set rule. If a Set ends when the half clock shows five seconds (0:05) or less remaining, the next Set begins immediately, and it begins in No-Blocking. Blocking is suspended from the start signal.'),
    c('7.6.5', 'Half expiration during a live set. If the half clock reaches 0:00 while a Set is in progress, the half clock is stopped. The Set continues until it is decided. At the next available Lull in Play after 0:00, officials shall:', [
      c('7.6.5.1', 'Distribute balls equally between both teams (three balls per side).'),
      c('7.6.5.2', 'Declare No-Blocking if it has not already been declared.'),
      c('7.6.5.3', 'Resume play on the start signal.'),
    ]),
  ]),
  c('7.7', 'Inter-set reset window and delay enforcement.', [
    c('7.7.1', 'Standard reset window. After a Set ends, teams have up to thirty (30) seconds to reset and line up for the next Set.'),
    c('7.7.2', 'Delay enforcement ladder. If a team is not ready within thirty (30) seconds:', [
      c('7.7.2.1', 'First occurrence in a half: verbal delay warning.'),
      c('7.7.2.2', 'Second occurrence in a half: Team Yellow Card.'),
      c('7.7.2.3', 'Further occurrences: additional Team Yellow Cards may be issued.'),
    ]),
  ]),
]);

const rule8 = r('8', 'Scoring', [
  c('8.1', 'Point value. Each Set win counts as one (1) point.'),
  c('8.2', 'Match winner. The team with the most points at the end of regulation wins the Match.'),
  c('8.3', 'Draw. If a match ends in a draw, a Tie-Breaking Set is played (Rule 29).'),
  c('8.4', 'Winning a Set. A Set is won when one team has zero (0) Live Players and the opposing team has at least one (1) Live Player.'),
  c('8.5', 'Forfeits.', [
    c('8.5.1', 'Forfeit results. When a team forfeits a Match, the Match ends immediately and is recorded as a Win by Forfeit for the non-offending team. When a team forfeits a Set, the Set ends immediately and is recorded as a Set win for the non-offending team.'),
    c('8.5.2', 'Forfeit Standings Score. For standings and tiebreakers only, Match forfeits are recorded using a standardized Forfeit Standings Score on a 12-point scale. This 12-point scale does not limit the number of Sets that may be played in a Match. It is used only to record forfeits consistently for seeding.'),
    c('8.5.3', 'Pre-match forfeit (No-Show). If a Match is forfeited before the Start Signal of the first Set, the Forfeit Standings Score is 12-0 in favor of the non-offending team.'),
    c('8.5.4', 'Forfeit after play has begun. If a Match is forfeited after play has begun, all Sets completed prior to the forfeit stand as recorded and are not replayed or replaced. The Match is then recorded for standings as follows, based on the Set score at the moment the forfeit is declared:', [
      c('8.5.4.1', 'Tie at the moment of forfeit. If the Match Set score is tied when the forfeit is declared, the Match is recorded as a Win by Forfeit for the non-offending team:', [
        c('8.5.4.1.1', 'If the combined Set Wins are fewer than twelve (12), apply Rule 8.5.4.2 below.'),
        c('8.5.4.1.2', 'If the combined Set Wins are twelve (12) or more, award one (1) additional Set Win to the non-offending team for standings purposes to break the tie.'),
      ]),
      c('8.5.4.2', 'Combined Set Wins fewer than twelve (12). If the combined Set Wins recorded at the moment the forfeit is declared are fewer than twelve (12), record the Match using a Forfeit Standings Score that awards the non-offending team twelve (12) total Set Wins while preserving the forfeiting team\'s earned Set Wins.'),
      c('8.5.4.3', 'For avoidance of doubt, if the Set score at the moment of forfeit is A-B (non-offending team A, forfeiting team B), the final Forfeit Standings Score is 12-B.'),
      c('8.5.4.4', 'Combined Set Wins twelve (12) or more (and not tied). If the combined Set Wins recorded at the moment the forfeit is declared are twelve (12) or more, and the Match Set score is not tied, the Match is recorded for standings using the Set score at the moment the forfeit is declared. No Forfeit Standings Score adjustment is applied.'),
    ]),
    c('8.5.5', 'Removal from a competition format. If a team is removed from a competition format (Round Robin or Playoffs), all remaining unplayed Matches scheduled for that team in that format are recorded as pre-match forfeits with a Forfeit Standings Score of 12-0 awarded to the non-offending team.'),
    c('8.5.6', "Protection of standings impact. A forfeit ruling may not reduce the non-offending team's final recorded Set differential below the non-offending team's Set differential at the moment the forfeit is declared. If there is a conflict, the technical scoring rules in this section control."),
    c('8.5.7', 'Standings-only. Technical forfeit scoring applies for standings only and does not change disciplinary sanctions or suspensions issued under Rule 34 or Rule 35.'),
  ]),
]);

const rule9 = r('9', 'Starting the Match', [
  c('9.1', 'Team readiness before the match. Both teams must be present on the Playing Court at least five (5) minutes before the scheduled match start time.'),
  c('9.2', 'Start of each half. Both teams must be lined up for the Opening Rush at the scheduled start time of each half.'),
  c('9.3', 'Change of sides. At the end of the first half, teams change sides.'),
]);

const rule10 = r('10', 'Ball Placement', [
  c('10.1', 'Placement on Center Line. At the start of each Set, six (6) balls shall be placed on the Center Line. Three (3) balls shall be positioned on each side of the Center Line, between the Side Line and the second outermost ball marking, as defined by the court markings for the event.'),
  c('10.2', 'Placement responsibility. The Match Officials are responsible for confirming balls are correctly placed prior to the start signal.'),
]);

const rule11 = r('11', 'Opening Rush', [
  c('11.1', 'Opening Rush.', [
    c('11.1.1', "During the Opening Rush, each team has three (3) designated balls. A team's designated balls are the three (3) balls positioned on that team's right side of the Center Line when facing the Center Line from that team's Back Line.", [
      c('11.1.1.1', "Until a team has activated all three (3) of its designated balls, that team may retrieve only its own designated balls."),
      c('11.1.1.2', "After a team has activated all three (3) of its designated balls, that team may retrieve the opponent's designated balls."),
    ]),
    c('11.1.2', 'During the Opening Rush, players may touch or cross the Center Line while retrieving balls.'),
  ]),
  c('11.2', 'Starting stance. Play begins with all players positioned as follows:', [
    c('11.2.1', 'Each player must have at least one foot in contact with the Back Line.'),
    c('11.2.2', "The player's other foot must be in contact with the court surface inside the Boundary Lines."),
    c('11.2.3', 'A player may start with both feet in contact with the Back Line, provided no part of either foot is outside the Boundary Lines.'),
    c('11.2.4', "No part of a player's body may be outside the Boundary Lines at the moment of the start signal."),
  ]),
  c('11.3', 'Start procedure. Match officials will start play using the following procedure:', [
    c('11.3.1', 'Call teams to "Line Up" to order teams to take their places.'),
    c('11.3.2', 'Verify each team is ready using audible and visual indicators (calling "Ready" for each team).'),
    c('11.3.3', 'Once both teams are confirmed ready, the start signal must be given within two (2) seconds. The start signal may be a whistle, visual signal, or both depending on venue conditions.'),
  ]),
  c('11.4', 'Live status at start. On the start signal, all players on the court become Live Players.', [
    c('11.4.1', 'After the start signal, a player must be fully within the Boundary Lines before the player may touch any ball positioned on the Center Line.', [
      c('11.4.1.1', 'For purposes of this rule, "fully within" means no part of either foot is on or outside any Boundary Line.'),
    ]),
  ]),
]);

const rule12 = r('12', 'False Starts', [
  c('12.1', 'A false start occurs if any player\'s foot loses contact with the Back Line after Match Officials have confirmed either team to be "Ready", but before the start signal is given.'),
  c('12.2', 'Warnings and Consequences.', [
    c('12.2.1', 'Warning. Each false start results in one (1) false start warning to the offending team.'),
    c('12.2.2', 'Escalation within a half. After a team has received one (1) false start warning in a half, each subsequent false start by that team in the same half results in the offending player starting the Set in the Player Queue.', [
      c('12.2.2.1', 'A player who starts in the Player Queue is treated as an Out Player until they legally re-enter on a catch, in accordance with the re-entry rules.'),
    ]),
    c('12.2.3', 'Reset of warnings.', [
      c('12.2.3.1', 'Half reset. False start warnings reset to zero at the start of each half.'),
      c('12.2.3.2', 'Overtime continuity. If overtime is played, overtime is treated as a continuation of the second half for purposes of false start warnings and consequences.'),
    ]),
  ]),
]);

const rule13 = r('13', 'Ball Activation', [
  c('13.1', "Activation requirement. Any ball retrieved by a team during the Opening Rush becomes a Live Ball for that team only when the ball fully crosses that team's own Activation Line (the Activation Line in that team's half of the court).", [
    c('13.1.1', 'A ball thrown before it has been activated cannot render an opposing player Out.'),
    c('13.1.2', 'A ball thrown before it has been activated is not eligible to be caught by an opposing player.'),
  ]),
]);

const rule14 = r('14', 'Throwing', [
  c('14.1', 'Balls may be thrown only by Live Players.'),
  c('14.2', 'A throw may be performed with one (1) or two (2) hands, including overhand, underhand, sidearm, or chest push styles.'),
  c('14.3', "A throw occurs only when the ball fully leaves the player's hand(s). A ball is considered thrown at the moment the throwing player is no longer in contact with the ball."),
  c('14.4', 'Valid Attempts.', [
    c('14.4.1', 'A valid attempt is a genuine, observable effort to hit an opposing Live Player.'),
    c('14.4.2', 'For the purposes of this rule, a "valid attempt" is intended to prevent subversion of the natural flow of play, including manipulation of Burden.'),
  ]),
  c('14.5', 'Invalid Attempts.', [
    c('14.5.1', 'An invalid attempt is a throw that is made primarily to avoid engagement or to manipulate match flow, including Burden.'),
    c('14.5.2', 'To reduce subjectivity, invalid attempts include, but are not limited to, the following objective indicators:', [
      c('14.5.2.1', 'The throw is directed into open space with no opposing Live Player within a reasonable throwing lane.'),
      c('14.5.2.2', 'The throw is released with clearly reduced power inconsistent with an attempt to hit (for example, a gentle roll, soft toss, or deliberate dump).'),
      c('14.5.2.3', 'The throw does not create a reasonable hit opportunity.'),
      c('14.5.2.4', 'The team repeats similar throws within the same Set after receiving an invalid attempt warning.'),
    ]),
    c('14.5.3', 'A team must receive one (1) verbal warning for an invalid attempt before any penalty is applied.', [
      c('14.5.3.1', 'Warning and Escalation. After a warning has been issued to that team in the same Match:', [
        c('14.5.3.1.1', 'Second invalid attempt: the offending player is rendered Out.'),
        c('14.5.3.1.2', 'Third invalid attempt: At the next available Lull in Play, the Head Referee stops play.', [
          c('14.5.3.1.2.1', 'Each offending player is rendered Out, and'),
          c('14.5.3.1.2.2', 'the offending team forfeits one (1) ball in its Control, for each offending player, to the opposing team.'),
        ]),
        c('14.5.3.1.3', 'Further invalid attempts:', [
          c('14.5.3.1.3.1', 'each offending Player(s) is rendered Out,'),
          c('14.5.3.1.3.2', 'the offending team forfeits one (1) ball in its Control, for each offending player, to the opposing team, and'),
          c('14.5.3.1.3.3', 'the offending team receives a Team Yellow Card.'),
        ]),
      ]),
    ]),
    c('14.5.4', 'A block attack does not create a Live Ball for purposes of putting an opposing player Out. Any ball that crosses the Center Line due solely to Blocking (ball-to-ball contact while still in a player\'s Control) is treated as a non-thrown ball and is ineligible to be caught.', [
      c('14.5.4.1', 'For purposes of this rule, "block attack" is contact that propels a ball across the Center Line without the ball being thrown (Rule 14.3).'),
    ]),
  ]),
  c('14.6', 'Uncontrolled releases and equipment defects.', [
    c('14.6.1', 'The following are not treated as invalid attempts, provided the Match Officials determine they were not part of a pattern of subversion (Rule 14.5.2):', [
      c('14.6.1.1', "Uncontrolled release. The ball unintentionally leaves a player's hand(s) due to loss of grip, slip, or mishandling, and the release is immediately recognizable as uncontrolled by its trajectory, velocity, or body mechanics."),
      c('14.6.1.2', 'Defective ball release. A ball that is torn, deformed, or otherwise compromised such that it cannot reasonably maintain normal velocity or direction, and this condition is observable to Match Officials.'),
    ]),
  ]),
  c('14.7', 'A single questionable throw should not be penalized as an invalid attempt unless it clearly meets Rule 14.5.2.', [
    c('14.7.1', 'However, repeated "slip" explanations may be treated as subversion if the objective indicators (Rule 14.5.2) are repeatedly present. Officials should evaluate patterns, not excuses.'),
  ]),
]);

const rule15 = r('15', 'Burden', [
  c('15.1', 'Burden is a timed requirement used to prevent stalling. Burden is assigned to one team at a time.'),
  c('15.2', 'Burden is assigned using the first applicable condition below:', [
    c('15.2.1', 'The team with Burden Possession of a majority of the balls in play.'),
    c('15.2.2', 'If both teams have Burden Possession of exactly half the balls in play, the team with more Live Players.'),
    c('15.2.3', 'If both teams have equal Live Players, the team that did not throw most recently.'),
    c('15.2.4', 'If neither team has thrown in the current Set, the team that is winning the Match.'),
    c('15.2.5', 'If the Match score is tied, the team that won the last Set.'),
    c('15.2.6', 'Burden Possession is used only to assign Burden and does not determine whether a ball is Live, Dead, caught, or controlled.'),
  ]),
  c('15.3', 'The team with Burden has ten (10) seconds to make a valid attempt to release Burden.', [
    c('15.3.1', 'The Burden countdown begins when Burden is assigned under Rule 15.2. Match Officials should announce Burden when practical, but the Burden countdown applies regardless of whether Burden has been verbally announced.'),
    c('15.3.2', 'The ten (10) second Burden countdown resets only when a valid attempt is made by either team. An invalid attempt does not reset the Burden countdown.'),
    c('15.3.3', 'If five (5) seconds elapse without a valid attempt by the team with Burden, Match Officials shall begin an audible five (5) second countdown for the remainder of the Burden time.'),
    c('15.3.4', 'The Burden countdown may be paused only under the Burden pause conditions defined in Rule 15.6.'),
  ]),
  c('15.4', 'If the team with Burden does not make a valid attempt (Rule 14.3) within ten (10) seconds:', [
    c('15.4.1', 'Officials stop play immediately.'),
    c('15.4.2', 'The offending team forfeits all balls currently in its Control to the opposing team.'),
    c('15.4.3', 'All players line up with at least one foot on the Back Line.'),
    c('15.4.4', "Play resumes on the Head Referee's start signal. All balls are considered Live upon the restart. No Opening Rush is performed."),
  ]),
  c('15.5', 'If a ball travels beyond the Playing Area, including onto an adjacent court or outside the immediate court space, Possession for Burden purposes is determined by the side of the Center Line from which the ball last exited the Boundary Lines.', [
    c('15.5.1', 'If the last-exit side cannot be determined by observation, the Head Referee awards Possession as a last resort.'),
  ]),
  c('15.6', "If a ball's position cannot be reasonably attributed to one side, or if it lies directly on the Center Line extension and last exit side cannot be determined, the Match Officials award Possession. This determination must be used only when the attribution cannot be made by observation."),
  c('15.7', 'A team must not willfully manipulate ball location to subvert Burden or Possession determination.', [
    c('15.7.1', 'Willful Manipulation is treated as an Invalid Attempt for enforcement under Rule 14.5.'),
    c('15.7.2', 'Repeated or egregious manipulation is unsportsmanlike conduct and may result in a Player Yellow card, Team Yellow Card, or worse.'),
  ]),
  c('15.8', 'The Head Referee may pause or delay the Burden countdown only when necessary to preserve the flow of the Match and only under the conditions below.', [
    c('15.8.1', 'Burden may be paused when one or more of the following occurs:', [
      c('15.8.1.1', 'A ball exits the Playing Area and cannot be replaced by Match Officials or retrieved without a Retriever leaving the Playing Area or crossing into an adjacent court space.'),
      c('15.8.1.2', 'A ball becomes unusable during play (for example, torn or deformed) and a replacement ball must be procured.'),
      c('15.8.1.3', 'Match Officials have suspended play for safety or match administration and ball availability would otherwise make Burden enforcement unreasonable.'),
    ]),
    c('15.8.2', 'Only the Head Referee may pause Burden.', [
      c('15.8.2.1', 'The pause must be announced clearly.'),
      c('15.8.2.2', 'The pause must end as soon as the retrieval or replacement issue is resolved.'),
      c('15.8.2.3', 'Burden may not be paused to benefit a team that intentionally caused a ball to leave the Playing Area or intentionally rendered a ball unusable.'),
      c('15.8.2.4', 'Burden pauses should be kept as short as possible. Officials must favor continuity of play.'),
    ]),
    c('15.8.3', 'The Head Referee must clearly announce ("Burden live" or "Game on" or similar) when Burden resumes, and the countdown continues from the point at which it was paused, unless play has been formally reset.'),
  ]),
]);

const rule16 = r('16', 'Live Ball and Dead Ball status', [
  c('16.1', 'A thrown Live Ball becomes a Dead Ball immediately when it contacts a Dead Object. (See Definition: Dead Object.)', [
    c('16.1.1', 'Ball-to-ball contact in free flight. If a thrown Live Ball collides with an opposing thrown Live Ball while both balls are in free flight, both balls become Dead immediately upon contact.'),
    c('16.1.2', 'Ball-to-ball contact on a block. If a thrown Live Ball makes contact with a ball that is in Control of a player (a block), the thrown Live Ball remains Live after ball-to-ball contact and becomes Dead only when it later makes contact with a Dead Object.', [
      c('16.1.2.1', 'Blocked thrown ball becoming Dead. A thrown Live Ball that has been blocked becomes Dead only when:', [
        c('16.1.2.1.1', 'It contacts a Dead Object, or'),
        c('16.1.2.1.2', 'It becomes Dead as the result of a valid catch (Rule 22.7) by the same team that last had Control of that ball.'),
      ]),
    ]),
  ]),
  c('16.2', 'Same-team ball contact. Ball-to-ball contact between two balls thrown by the same team does not change Live Ball or Dead Ball status. Each ball remains Live until it becomes Dead under Rule 16.1.'),
]);

const rule17 = r('17', 'Hits', [
  c('17.1', 'A player who is hit may complete any action already in progress at the moment of contact until the Live Ball becomes Dead.'),
  c('17.2', 'If a player is hit while a catch is in progress, the following apply:', [
    c('17.2.1', 'If the catch that was first in progress is completed, that catch is valid.'),
    c('17.2.2', 'The second ball that hit the player remains eligible to be caught by any Live Player on the player\'s team.', [
      c('17.2.2.1', 'If the Live Ball that hit the player becomes Dead before any Live Player on the player\'s team catches it, the player is rendered Out. The previous valid catch remains a valid catch.'),
    ]),
    c('17.2.3', 'The validity of the first catch is not affected by the outcome of the ball that hit the player during the catch in progress.'),
  ]),
]);

const rule18 = r('18', 'Traps', [
  c('18.1', 'A Trap occurs when a Live Ball makes contact with a player and the Playing Surface simultaneously, or in a manner that Match Officials determine to be simultaneous (i.e., no observable separation between player contact and surface contact).'),
  c('18.2', 'A Trap is not a catch. The ball is Dead and the contacted player is rendered Out.'),
]);

const rule19 = r('19', 'Blocking', [
  c('19.1', 'A Live Player may use one (1) or more balls to block a Live Ball from contacting the player.'),
  c('19.2', 'A disarming event occurs when a player blocks a Live Ball and, as a result, the blocking ball is knocked free and is no longer in Control of any Live Player on the blocking team.'),
  c('19.3', 'A disarmed ball remains Live and may be caught by any Live Player.'),
  c('19.4', 'Following a disarming event, the blocking team is not penalized if any Live Player on the blocking team establishes Control of the disarmed ball before it contacts any Dead Object.'),
  c('19.5', 'If the disarmed ball contacts any Dead Object before Control is re-established by the blocking team, the blocking player is rendered Out.'),
]);

const rule20 = r('20', 'Out Players', [
  c('20.1', 'An Out Player is:', [
    c('20.1.1', "a Live Player who has been rendered Out when a Live Ball contacts any part of the player's body, including hair, or any part of the player's equipment or uniform, and that Live Ball subsequently becomes Dead by making contact with a Dead Object."),
    c('20.1.2', "A Live Player who makes contact with any Boundary Line or Playing Surface outside of their Fair Territory."),
    c('20.1.3', "A player who uses a ball to prevent themselves from becoming out of bounds, including but not limited to:", [
      c('20.1.3.1', "Placing or pushing a ball against the ground outside of, or on, the Boundary Lines, or an object to brace, stop, or redirect their body's movement out of bounds."),
      c('20.1.3.2', 'Any contact or weight bearing on any object that is on the boundary lines or outside the boundary lines.'),
    ]),
  ]),
  c('20.2', 'Out Players have left their Fair Territory and are either on their way to the Queue or waiting in the Queue to return to play.'),
  c('20.3', 'An Out player can temporarily leave the Queue if needed but must make a good faith effort to remain / return to the Queue as soon as possible.'),
]);

const rule21 = r('21', 'Exiting Players', [
  c('21.1', 'An Exiting Player is a player who has been rendered Out and is in the process of leaving their Fair Territory and joining the Queue.'),
  c('21.2', 'Exiting Players must relinquish Possession of any ball(s) that were in their Control when they were rendered Out.', [
    c('21.2.1', "Possession must remain with the Exiting Player's team."),
    c('21.2.2', 'Exiting Players may pass balls that were in their Control when they were rendered Out.'),
  ]),
  c('21.3', 'An Exiting Player must leave their Fair Territory as quickly as possible by crossing the nearest Boundary Line. After exiting, the player must proceed directly to the Queue Area.', [
    c('21.3.1', 'An Exiting Player may not re-enter their Fair Territory unless a valid catch is completed by their team before the Exiting Player reaches the Queue. The Exiting Player becomes an Entering Player and may re-enter immediately via the Back Line without first taking position in the Queue.'),
  ]),
  c('21.4', 'An Exiting Player must take position at the end of the Queue behind any players who were rendered Out earlier.'),
  c('21.5', 'An Exiting Player must not materially impact play, including but not limited to:', [
    c('21.5.1', 'Contacting, stopping, redirecting, shielding, or kicking any Live Ball.'),
    c('21.5.2', "Obstructing an opposing player's movement to retrieve a ball."),
    c('21.5.3', 'Intentionally positioning themselves to affect a throw, catch, or retrieval lane.'),
  ]),
  c('21.6', 'If an Exiting Player materially impacts play:', [
    c('21.6.1', 'First occurrence by a team in a Match: verbal warning.'),
    c('21.6.2', 'Second occurrence by the same team in a Match: the offending team forfeits one (1) ball that is in their Possession.'),
    c('21.6.3', 'Egregious or repeated interference may result in the offending player receiving a Yellow Card and/or Team Yellow Card(s).'),
  ]),
]);

const rule22 = r('22', 'Catching', [
  c('22.1', 'A Live Ball may be caught only by an opposing Live Player, except in a disarming event (Rule 19.2 through 19.5).'),
  c('22.2', 'A valid catch renders the throwing player Out immediately after the catch is complete.'),
  c('22.3', 'A catch is complete only when both of the following conditions are met:', [
    c('22.3.1', 'The catching player has Control of the ball, and'),
    c('22.3.2', "The catching player establishes at least one (1) point of contact with the court surface within the Boundary Lines of their Fair Territory while maintaining Control."),
    c('22.3.3', 'Control may be established while airborne, but the catch is not complete until the in-bounds contact requirement is met.'),
  ]),
  c('22.4', 'A catching player may use the ball being caught to protect themselves while landing, including using it to block a Live Ball. Until the catch is complete, the ball being caught remains Live.'),
  c('22.5', 'If the ball contacts any Dead Object before the catch is complete, the catch is invalid and the catching player is rendered Out if the ball also makes contact with the player.'),
  c('22.6', 'A player must not use any part of their uniform or clothing to assist a catch, including trapping, cradling, or pinning the ball against the body using clothing. A catch completed using the uniform is invalid.'),
  c('22.7', 'Once a catch is complete and valid, the caught ball becomes Dead.'),
  c('22.8', 'If a Live Ball is caught after being deflected by one or more players on the catching team, those deflecting players are not rendered Out as a result of the deflection, provided the catch becomes complete and valid (Rule 22.3).'),
]);

const rule23 = r('23', 'Re-entry on a catch', [
  c('23.1', 'When a catch is complete and valid, the catching team is entitled to return one (1) player to the court. That player becomes an Entering Player.'),
  c('23.2', 'Entering Players must re-enter in the order in which they were rendered Out. The first eligible player is the player at the front of the Queue.'),
  c('23.3', 'If a catch is complete and valid before the first eligible Out Player of the catching team reaches the Queue, that player may re-enter immediately via the Back Line without first taking position in the Queue.'),
]);

const rule24 = r('24', 'Entering Players', [
  c('24.1', 'An Entering Player is a player who is entitled to return to the court after having previously been in the Queue.'),
  c('24.2', "An Entering Player must step into their team's Fair Territory immediately over the Back Line in their team's half of the court."),
  c('24.3', 'An Entering Player becomes a Live Player as soon as they establish at least one (1) point of contact inside the Boundary Lines.'),
  c('24.4', 'Until they become a Live Player (24.3), an Entering Player may not:', [
    c('24.4.1', 'Be rendered Out, or'),
    c('24.4.2', 'Hit an opposing player Out, or'),
    c('24.4.3', 'Catch, block, or otherwise make a play.'),
  ]),
  c('24.5', 'An Entering Player must not touch, pick up, carry, roll, or otherwise take Control of any ball until they have become Live. If an Entering Player touches or takes Control of a ball before becoming Live, the Entering Player is rendered Out immediately and must return to the Queue.'),
  c('24.6', 'An Entering Player must enter without undue delay. If the Match Officials determine the first eligible Entering Player is willfully delaying entry to subvert flow of play, the Entering Player is rendered Out. For avoidance of doubt, "undue delay" means an unreasonable, excessive, or unjustified delay of approximately five (5) seconds before entering the team\'s Fair Territory.'),
]);

const rule25 = r('25', 'Boundaries and Out of Bounds', [
  c('25.1', "The Boundary Lines define the Playing Court and each team's Fair Territory. For purposes of these rules, the Boundary Lines are part of out of bounds. If any part of a player's body contacts any Boundary Line, the player is out of bounds."),
  c('25.2', "A player is out of bounds if any part of the player's body makes contact with:", [
    c('25.2.1', 'any Dead Object outside the Boundary Lines, including the Playing Surface, any venue or court equipment, or any non-participant or non-Active person.', [
      c('25.2.1.1', 'For purposes of this Rule 25 only, contact with any ball (Live or Dead) does not, by itself, constitute contact with a Dead Object.'),
    ]),
    c('25.2.2', 'the opponent\'s territory, including any contact with or across the Center Line.'),
  ]),
  c('25.3', "A Live player may pick up any balls that are within reach, without regard to the ball's position in or outside of their team's Fair Territory."),
  c('25.4', 'During the Opening Rush only, players may touch or cross the Center Line while retrieving balls as permitted under the Opening Rush rules.'),
  c('25.5', "If a player becomes out of bounds while attempting a play, the determining factor is whether the play was completed before any part of the player's body became out of bounds.", [
    c('25.5.1', 'For purposes of this rule:', [
      c('25.5.1.1', 'A throw is completed at the moment of release.'),
      c('25.5.1.2', 'A catch is completed only when it meets the catch completion standard (Control plus at least one point of contact in bounds).'),
      c('25.5.1.3', 'A block is completed at the moment the ball-to-ball contact occurs.'),
    ]),
  ]),
]);

const rule26 = r('26', 'Wash resolution', [
  c('26.1', 'If simultaneous elimination results in zero (0) Live Players on both teams, the outcome is a Wash. No point is awarded. The Set continues. To continue play with no discretion, apply the following:', [
    c('26.1.1', 'The elimination event that produced the Wash is nullified. The players eliminated by that simultaneous elimination remain Live.'),
    c('26.1.2', 'No Ball Reset is performed.'),
    c('26.1.3', 'Possession is not flipped as a result of the Wash.'),
    c('26.1.4', "Play resumes on the Head Referee's signal at the next practical moment."),
  ]),
]);

const rule27 = r('27', 'Simultaneous Play', [
  c('27.1', 'Simultaneous play occurs when two (2) or more plays occur such that Match Officials cannot determine a clear order of completion by observation.'),
  c('27.2', 'When simultaneous play occurs, the results of the plays are resolved simultaneously.', [
    c('27.2.1', 'If two opposing Live Players throw while both are Live Players and both players are hit as a result of those throws, both players are rendered Out.'),
    c('27.2.2', 'If, after resolving the mutual elimination, at least one Live Player remains on either team, normal play continues immediately.'),
    c('27.2.3', 'If a simultaneous elimination results in zero (0) remaining Live Players on both teams, the outcome is a Wash.'),
    c('27.2.4', 'When a Wash occurs:', [
      c('27.2.4.1', 'No point is awarded.'),
      c('27.2.4.2', 'The Set continues as a continuation of the same Set.'),
      c('27.2.4.3', 'No Ball Reset is performed.'),
      c('27.2.4.4', 'Possession is not flipped as a result of the Wash.'),
      c('27.2.4.5', 'The players involved in the simultaneous elimination that produced the Wash remain Live and continue play.'),
    ]),
    c('27.2.5', "Play resumes on the Match Official's signal at the next practical moment."),
    c('27.2.6', 'The Set ends when one team is eliminated in accordance with the Set win condition.'),
  ]),
]);

const rule28 = r('28', 'No-Blocking transition', [
  c('28.1', 'Initiation. No-Blocking may be initiated only under the following conditions:', [
    c('28.1.1', 'End of half: When regulation half time expires (0:00 on the Half Clock) while a Set is in progress. A Ball Reset shall be performed as part of this transition.'),
    c('28.1.2', 'End of timed set: When the Set duration expires and the Set has not been decided. No Ball Reset is performed during this transition.'),
  ]),
  c('28.2', 'Effective moment. The No-Blocking rules below apply only after No-Blocking has been officially declared by a Match Official. Prior to the declaration, regular blocking rules apply.'),
  c('28.3', "Effect. During No-Blocking, any ball in a Live Player's Control is treated as an extension of the player's body for purposes of resolving hits by an opponent's thrown Live Ball."),
  c('28.4', 'Blocking treated as a hit. During No-Blocking, if an opponent\'s thrown Live Ball makes contact with a ball in a Live Player\'s Control (a "No-Blocking block"), that contact is treated the same as the opponent\'s thrown Live Ball hitting the player\'s body.'),
  c('28.5', 'Save by catch. After a No-Blocking block:', [
    c('28.5.1', "The opponent's thrown Live Ball remains Live and may be caught by any Live Player on the blocking player's team (including the blocking player), subject to the Catching rules."),
    c('28.5.2', "If the opponent's thrown Live Ball is caught before it becomes Dead, the catch is valid and is resolved under the Catching rules (including the Out of the throwing player and Re-Entry outcomes)."),
    c('28.5.3', "If the opponent's thrown Live Ball becomes Dead before being caught by a Live Player on the blocking player's team, the blocking player is rendered Out."),
  ]),
  c('28.6', "Completion of action. A player who is subject to Rule 28.4 may complete any action already in progress at the moment of contact until the opponent's thrown Live Ball becomes Dead."),
  c('28.7', "No additional penalty for subsequent contact. If, after a No-Blocking block, the opponent's thrown Live Ball makes additional contact with the blocking player or the ball in the player's Control, resolution is still governed by Rule 28.4."),
]);

const rule29 = r('29', 'Tie-Breaking Set', [
  c('29.1', 'When played. A Tie-Breaking Set is played if a regulation (playoff or bracket) match ends in a draw.'),
  c('29.2', 'Duration. The Tie-Breaking Set uses the same Set timing rules. It consists of up to three (3) minutes of regular play, then No-Blocking is declared at the next available Lull in Play and remains in effect for the remainder of the Tie-Breaking Set.'),
  c('29.3', 'Winner. The first team to win the Tie-Breaking Set wins the Match.'),
]);

const rule30 = r('30', 'Code of Conduct', [
  c('30.1', 'Players and team officials may be penalized for aggressive, abusive, discriminatory, unsafe, or unsportsmanlike behavior.'),
  c('30.2', 'Prohibited conduct includes, but is not limited to:', [
    c('30.2.1', 'Fighting, attempting to assault another participant, or uninvited physical contact.'),
    c('30.2.2', 'Discriminatory comments or actions regarding sex, gender, sexual orientation, race, religion, creed, ethnicity, age, or other protected characteristics.'),
    c('30.2.3', 'Taunting intended to provoke or escalate conflict.'),
    c('30.2.4', 'Throwing a ball at an opposing player after being clearly rendered Out.'),
    c('30.2.5', 'Cheating or deliberate misrepresentation to officials.'),
    c('30.2.6', 'Causing unreasonable delay to the Match.'),
    c('30.2.7', 'Performing actions intended to gain unfair advantage through unsportsmanlike means.'),
  ]),
]);

const rule31 = r('31', 'General Penalty Principles', [
  c('31.1', 'If a player receives a penalty that requires the Penalty Area, the player must report to the Penalty Area immediately and remain there for the duration of the penalty (3-minutes).'),
  c('31.2', 'A player serving a penalty remains an Active Player for roster purposes and may not be substituted for the duration of the penalty.'),
  c('31.3', "When a player's penalty ends, the player re-enters eligibility as follows:", [
    c('31.3.1', 'If the penalty ends during a Set, the player must join the end of the Queue and may re-enter only under the normal re-entry rules.'),
    c('31.3.2', 'If the penalty ends between Sets, the player may fully participate in the next Set.'),
  ]),
  c('31.4', 'Match officials may issue a verbal warning when an offense does not warrant an immediate card. Repeated minor offenses after a warning may be penalized with a card.'),
]);

const rule32 = r('32', 'Card Accumulation and Match Forfeiture', [
  c('32.1', 'A Match is not forfeited due solely to the accumulation of Player Yellow Cards or Team Yellow Cards.'),
  c('32.2', 'A Player Yellow Card does not result in automatic suspension beyond the current Match unless a Player Red Card is issued.'),
  c('32.3', 'A Team Red Card results in immediate Match forfeiture.'),
  c('32.4', 'Carryover within formats', [
    c('32.4.1', 'Cards issued in Round Robin carry for the remainder of Round Robin.'),
    c('32.4.2', 'Cards issued during Playoffs carry for the remainder of Playoffs.'),
    c('32.4.3', 'Player Red Card suspensions carry forward across formats as required, including Round Robin into Playoffs.'),
    c('32.4.4', 'Carryover applies for recordkeeping and disciplinary eligibility and does not retroactively change Match or Set results.'),
  ]),
]);

const rule33 = r('33', 'Ball Retriever Penalties', [
  c('33.1', 'Match officials may remove a Ball Retriever from retriever duties for unsafe or disruptive behavior including, but not limited to, repeated failure to follow official instructions.'),
  c('33.2', 'A removed Ball Retriever must be replaced immediately by another Ball Retriever. A non-player or inactive player may serve as the replacement.'),
  c('33.3', "Removal under this section is role-based and does not automatically suspend a player's eligibility to participate as a player unless a separate player penalty is issued under this Part."),
]);

const rule34 = r('34', 'Yellow Cards', [
  c('34.1', 'Player Yellow Card', [
    c('34.1.1', 'When a player receives a yellow card, they will be sent to the Penalty Area immediately and have to remain there for a period of 3 minutes of active match time.'),
    c('34.1.2', '"Active match time" means time during which the half clock is running. Time does not count during timeouts or official stoppages.'),
    c('34.1.3', 'If a half ends while a player is serving a penalty, the remaining penalty time carries into the next half.'),
    c('34.1.4', 'A player may receive only one (1) Player Yellow Card in a Match. Any subsequent offense that warrants a Player Yellow Card is issued as a Player Red Card instead.'),
  ]),
  c('34.2', 'Team Yellow Card', [
    c('34.2.1', 'A Team Yellow Card is a team-level sanction.'),
    c('34.2.2', 'Each Team Yellow Card counts as one (1) Yellow Card equivalent for purposes of Rule 32.'),
    c('34.2.3', 'If a team receives a Team Yellow Card during a Set, that team forfeits the current Set immediately.'),
    c('34.2.4', 'If a team receives a Team Yellow Card between Sets, or after a Match has concluded but before the match sheet is signed, that team forfeits one (1) Set.', [
      c('34.2.4.1', 'The forfeited Set is the next Set to be played.'),
      c('34.2.4.2', 'If forfeiting a Set results in a draw, the Tie-Breaking Set rules apply.'),
    ]),
    c('34.2.5', 'Each Team Yellow Card affects Set results only and does not convert into a Team Red Card.'),
    c('34.2.6', 'A Team Red Card may be issued only for severe misconduct as defined in Rule 35.'),
  ]),
]);

const rule35 = r('35', 'Red Cards', [
  c('35.1', 'Player Red Cards', [
    c('35.1.1', 'When a player receives a Red Card, the player is immediately ejected from the Match.'),
    c('35.1.2', "When a player receives a Red Card, the player's team plays short-handed for the remainder of the Match."),
    c('35.1.3', "A player receiving a Red Card is suspended from participating in the team's next two (2) Matches."),
    c('35.1.4', 'Depending on the severity of the offense further penalties may be issued by tournament officials or WDBF representatives after the match concludes.'),
  ]),
  c('35.2', 'Team Red Cards', [
    c('35.2.1', 'A Team Red Card is issued only for severe misconduct including, but not limited to:', [
      c('35.2.1.1', 'fighting or attempted assault'),
      c('35.2.1.2', 'discriminatory abuse'),
      c('35.2.1.3', 'leaving the bench to engage'),
      c('35.2.1.4', 'repeated refusal to comply after a Team Yellow Card or after a direct instruction from a Head Referee'),
      c('35.2.1.5', 'any behavior that threatens safety'),
    ]),
    c('35.2.2', 'A Team Red Card results in immediate Match forfeiture.'),
  ]),
]);

const rule36 = r('36', 'Challenges', [
  c('36.1', 'Each team is permitted up to two (2) unsuccessful challenges per Match.', [
    c('36.1.1', 'A successful challenge does not count toward the two (2) unsuccessful challenges.'),
  ]),
  c('36.2', 'A team may challenge only the incorrect application of a rule by Match Officials.', [
    c('36.2.1', 'A challenge must be made immediately after the contested application of a rule and before the next restart of play.'),
  ]),
  c('36.3', 'Challenges may not be made for matters of judgment or discretion, including but not limited to: whether a player was hit, whether a ball was controlled, whether contact was simultaneous, whether an act was intentional, or whether an action materially impacted play.'),
  c('36.4', 'Only a Team Leader may initiate a challenge.'),
  c('36.5', 'Upon a valid challenge request, Match Officials shall stop play at the next available Lull in Play. If immediate stoppage is required to prevent an unfair advantage, Match Officials may stop play immediately.'),
  c('36.6', 'Match officials must attempt to resolve the challenge before play continues.'),
  c('36.7', 'Match officials may request assistance from other WDBF officials to resolve a challenge.'),
]);

const rule37 = r('37', 'Injuries', [
  c('37.1', 'Player Injury', [
    c('37.1.1', 'If a player becomes injured and requires immediate attention, Match Officials shall stop play immediately and suspend play for treatment.'),
    c('37.1.2', 'If an injured player is unable to continue live play during a Set, the team may substitute the injured player with an eligible rostered player who did not start the current Set.', [
      c('37.1.2.1', "When play resumes, the injured player's position is filled as follows:", [
        c('37.1.2.1.1', "The first eligible player at the front of that team's Queue enters as the Entering Player."),
        c('37.1.2.1.2', "The substitute player is added to the end of that team's Queue and becomes eligible to enter only through the normal re-entry process."),
        c('37.1.2.1.3', "If no player from that team is currently in the Queue, the substitute player may enter in the injured player's position, as directed by Match Officials."),
      ]),
    ]),
    c('37.1.3', 'If a player is substituted due to injury during a live Set, that player may not participate for the remainder of the Match.'),
    c('37.1.4', 'Match officials may require a player to be substituted or removed at any time if they determine the player presents an unreasonable safety risk to themselves or others.'),
  ]),
  c('37.2', 'Blood Injury', [
    c('37.2.1', "If a participant is found bleeding or blood is visible on the participant's uniform, Match Officials shall stop play immediately and suspend play to allow treatment."),
    c('37.2.2', 'A participant with a blood injury is immediately removed from play and may not participate further in the current Set under any circumstances, even if treatment is completed. The participant may return to play only in a subsequent Set after treatment has been administered and there is no visible blood on the participant or their uniform.'),
    c('37.2.3', 'Uniform rules may not be enforced in a manner that prevents a participant from changing or adjusting uniform items as reasonably required to address a blood injury or similar safety concern.'),
  ]),
]);

const reglaCalls = r('1', 'Standard Calls and Signals', [
  c('1.1', 'Required announcements. The Head Referee must use standardized calls for any action that affects timing, counts, restarts, or ball placement.'),
  c('1.2', 'Core calls', [
    c('1.2.1', '"Line up." Teams take starting positions.'),
    c('1.2.2', '"Ready." Team readiness confirmation.'),
    c('1.2.3', 'Start signal. Whistle and or visual signal to start.'),
    c('1.2.4', '"Play stopped." Play is suspended.'),
    c('1.2.5', '"Play live." Play resumes.'),
    c('1.2.6', '"Timeout." Timeout granted.'),
    c('1.2.7', '"Ten seconds." Timeout warning at 10 seconds remaining.'),
    c('1.2.8', '"Time in." Timeout ends, play about to resume.'),
    c('1.2.9', '"Burden on [team color or side]." Burden assigned.'),
    c('1.2.10', '"Count live." Burden countdown is running.'),
    c('1.2.11', '"Count paused." Burden countdown paused under the Burden pause rule.'),
    c('1.2.12', '"Count resumes." Burden countdown resumes.'),
    c('1.2.13', '"No-Blocking." No-Blocking is in effect.'),
    c('1.2.14', '"Set forfeited." Team Yellow Card during a set.'),
    c('1.2.15', '"Match forfeited." Team Red Card, or second Team Yellow conversion, or match forfeiture threshold reached.'),
    c('1.2.16', '"Challenge." A valid challenge has been initiated.'),
    c('1.2.17', '"Challenge unsuccessful." Challenge denied and counts toward the limit.'),
    c('1.2.18', '"Challenge successful." Challenge upheld and does not count toward the limit.'),
  ]),
  c('2', 'When to stop play immediately vs next lull', [
    c('2.1', 'Stop play immediately only for:', [
      c('2.1.1', 'Safety and injury.'),
      c('2.1.2', 'Blood rule.'),
      c('2.1.3', 'Burden violation that requires an immediate reset by rule.'),
      c('2.1.4', 'Administrative errors that would create an unfair advantage if play continues. Otherwise, apply corrections at the next available lull.'),
    ]),
  ]),
  c('3', 'Ball placement. When officials must determine or assign ball placement, announce one of the following:', [
    c('3.1', '"Ball stays." No movement, play continues.'),
    c('3.2', '"Ball placed here." Point to location and state which side has Possession if relevant.'),
    c('3.3', '"Ball Reset." Players to back line. State whether an Opening Rush occurs or not.'),
  ]),
  c('4', 'Consistency. If officials establish a standard for a recurring edge case in that match, apply it consistently for the remainder of the match.'),
]);

const reglamentoFoam: Reglamento = {
  formato: 'foam',
  tituloDocumento: 'WDBF Foam Dodgeball Rules 2026',
  fuente: 'World Dodgeball Federation (WDBF)',
  partes: [
    {
      numero: 'Part 1',
      titulo: 'Definitions and Interpretation Standards',
      secciones: [{ titulo: 'Definitions', reglas: [definiciones] }, { titulo: 'Interpretation Standards', reglas: [estandaresInterpretacion] }],
    },
    { numero: 'Part 2', titulo: 'Facilities and Equipment', secciones: [{ reglas: [rule1, rule2] }] },
    { numero: 'Part 3', titulo: 'Participants and Roles', secciones: [{ reglas: [rule3, rule4, rule5, rule6] }] },
    { numero: 'Part 4', titulo: 'Match Format and Timing', secciones: [{ reglas: [rule7, rule8] }] },
    { numero: 'Part 5', titulo: 'Set Start Procedures', secciones: [{ reglas: [rule9, rule10, rule11, rule12, rule13] }] },
    { numero: 'Part 6', titulo: 'Live Play Rules', secciones: [{ reglas: [rule14, rule15, rule16, rule17, rule18, rule19, rule20, rule21, rule22, rule23, rule24, rule25] }] },
    { numero: 'Part 7', titulo: 'Special Resolutions', secciones: [{ reglas: [rule26, rule27, rule28, rule29] }] },
    { numero: 'Part 8', titulo: 'Violations and Penalties', secciones: [{ reglas: [rule30, rule31, rule32, rule33, rule34, rule35] }] },
    { numero: 'Part 9', titulo: 'Challenges', secciones: [{ reglas: [rule36] }] },
    { numero: 'Part 10', titulo: 'Injuries', secciones: [{ reglas: [rule37] }] },
    {
      numero: 'Part 11',
      titulo: 'Diagrams',
      secciones: [
        {
          reglas: [
            r('', 'Diagram 1: Foam Dodgeball Court', [
              c('', 'El documento original incluye un diagrama de la cancha Foam. Las medidas exactas de cada línea están detalladas en la Regla 1 (Facilities) de este reglamento. Podés ver una recreación 3D de la cancha en la portada de Overtime.'),
            ]),
          ],
        },
      ],
    },
    { numero: 'Part 12', titulo: 'Officiating Guidelines', secciones: [{ reglas: [reglaCalls] }] },
  ],
};

export default reglamentoFoam;
