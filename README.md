# AI Engineer: Level Up

A 10-level, endlessly-randomized AI engineering quiz game. Build a character, earn new gear
every time you clear a level, and take the crown at the Capstone boss.
Every run generates **fresh questions** — students can't memorize their way to a win.

**Play it:** open `index.html` in any browser. No install, no build step, no server, no accounts,
no data leaves the device.

---

## The levels

| Level | Title | Principle tested |
|---|---|---|
| 1 | Boot Sequence | What AI is — patterns learned from data, not magic |
| 2 | Prompt Forge | Prompt engineering: task, context, examples, format |
| 3 | Inside the Machine | Tokens, embeddings, context windows, temperature |
| 4 | Pair Programmer | Building with AI — spec, generate, run, verify |
| 5 | Data Mines | Data quality, representation, consent, leakage |
| 6 | **The Responsibility Gate** | **Responsible AI: fairness, reliability & safety, privacy & security, inclusiveness, transparency, accountability** |
| 7 | Grounding Station | Retrieval and grounding — answers you can check |
| 8 | Agent Arena | Agents, tools, loops and guardrails |
| 9 | Ship It | Evaluation, debugging and shipping |
| 10 | BOSS: Capstone | Everything, combined, under pressure |

Responsible AI is a **required level** — nobody reaches the crown without clearing it.

---

## Character, gear and the crown

**Create your engineer.** Before the first question, players pick gender (girl, boy, non-binary,
or rather not say), hairstyle, skin tone, hair color and a starting outfit — or hit **Surprise me**.
Every character is drawn as inline SVG, so there are no image files and nothing to download.
Your look is remembered for next time; gear always starts fresh.

**Earn gear.** Clear a level and two pieces of loot drop at random from that level's table —
pick one and your character wears it immediately, in the HUD and on every screen after.
22 items across 7 slots (head, face, body, hand, side, cape, aura): Lab Goggles, Prompt Wand,
Token Visor, Dev Hoodie, Data Mine Hardhat, Grounding Anchor, Agent Drone, Robo Pup, Shipper Cape
and more. Because only 2 of 3 drop each time, no two runs dress the same.

**Level 6 is special.** Both of its drops are honors: the **Responsible AI Sash** or the
**Ethics Halo**.

**Beat the boss.** Clearing Level 10 always awards the **👑 Capstone Crown** — the only item
that can't be earned any other way — and unlocks a **printable certificate** with the player's
name, their crowned character, their score, accuracy and best streak, all ten levels listed,
and every piece of gear they collected. It prints clean (or saves as PDF) straight from the
browser, with signature and date lines for you.

---

## How the randomization works

Nothing is a fixed question list. Every question is built at runtime by a **generator** —
a small function that assembles a question from random names, numbers, cities, app ideas
and scenarios, then shuffles the answers.

Five layers of randomness:

1. **Random run seed** — a different pseudo-random universe every single play.
2. **Generated scenarios** — names, numbers, temperatures, dataset sizes and app ideas change each time.
3. **Shuffled answers** — the correct option is never in a fixed slot, and wrong answers are drawn randomly from a distractor pool.
4. **Random question selection and order** — each level draws a different subset from its pool, in a different order.
5. **Surprise callbacks** — from Level 4 on, questions from earlier levels reappear without warning. The boss pulls from all nine.

There are **1,000+ distinct question texts** before answer-shuffling, and a run only ever
shows 54 of them. A duplicate never appears twice in the same run.

## Scoring

- 3 lives — only a **wrong answer** costs one
- Running out of time **resets your streak but does not cost a life** (the correct answer is revealed, then you move on)
- Points scale with level, plus a speed bonus and a streak bonus
- Clear a level with a 4+ streak and you earn a life back
- Timer tightens as levels rise (40s → 20s)
- High score is kept in the browser's local storage
- The end screen names the **levels you missed most**, so it doubles as a study guide

## Classroom ideas

- **Warm-up:** 5 minutes at the start of class — Level 1 through the current level.
- **Exit check:** clear today's level before you leave.
- **Gear tournament:** everyone plays one run; compare characters at the end. Different loot every time.
- **Certificate wall:** print the boss certificates and post them.
- **Authoring challenge:** students write their own question generator, or design a new gear item in SVG, and open a pull request. Writing a good distractor proves they understand the concept.

## Troubleshooting

**Blank screen, or the "Create your character" button does nothing.**
Almost always a missing file or a cached old page. The game now tells you which:
if a script didn't load you'll see a red panel naming the missing file.

- All **four** files must sit in the same folder: `index.html`, `questions.js`, `avatar.js`, `game.js`.
  `avatar.js` is the newest one and is the usual one left behind.
- If you just replaced the files, **hard-refresh**: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac).
  A normal refresh can serve you the old cached page.
- On GitHub Pages, give it a minute after committing, then hard-refresh.

## Accessibility & privacy

Keyboard playable (`1`–`4` to answer, `Enter` to continue), high-contrast text, no audio required,
no flashing. Character art is inline SVG with an accessible label. Everything runs client-side —
no tracking, no network calls, no student data collected. The only thing stored is the player's own
look and high score, in their own browser.
