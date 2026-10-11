// Lesson content. One entry per lesson, keyed by course id and lesson number (1-10).
//
// To add or change a lesson, edit the entry below (or add a new course key). Nothing else needs to change:
// the lesson screen, progress and quizzes all read from here.
//   - `body`  : paragraphs. Wrap code words in `backticks` to show them as inline code.
//   - `code`  : optional example (file name, lines, and the text it prints when the learner taps Run).
//   - `tryIt` : a small exercise shown at the bottom.
//   - `tip`   : what the mentor says at the top.

import { TokenKind } from './learning';

export type LessonContent = {
  minutes: number;
  tip: string;
  body: string[];
  code?: { file: string; lines: string[]; output: string[] };
  tryIt: string;
};

const L = (
  minutes: number,
  tip: string,
  body: string[],
  tryIt: string,
  code?: { file: string; lines: string[]; output: string[] },
): LessonContent => ({ minutes, tip, body, tryIt, code });

const c = (file: string, lines: string[], output: string[]) => ({ file, lines, output });

const PYTHON: Record<number, LessonContent> = {
  1: L(5, 'Python reads almost like English, which is why it is a great first language.', [
    'Python is a general-purpose programming language used for websites, data analysis, automation and AI. You write instructions, and Python runs them from top to bottom.',
    'You do not need to install anything to start: every example here runs in the lesson. Later you can install Python on your computer and run files with `python main.py`.',
  ], 'Change the name in the greeting to your own name and run it again.',
  c('main.py', ['name = "Devly"', 'print("Hello from", name)'], ['Hello from Devly'])),
  2: L(5, '`print` is how a program talks to you. Use it constantly while learning.', [
    'The `print()` function shows text on the screen. Text must be wrapped in quotes, either single or double.',
    'You can print several things at once by separating them with commas. Python puts a space between them.',
  ], 'Add a third print line that shows your favourite food.',
  c('main.py', ['print("Welcome to Python")', 'print("2 + 3 =", 2 + 3)'], ['Welcome to Python', '2 + 3 = 5'])),
  3: L(6, 'A variable is just a name stuck onto a value. You can re-stick it any time.', [
    'A variable stores a value so you can use it later. Create one with `=`. The common types are `str` (text), `int` (whole numbers), `float` (decimals) and `bool` (True or False).',
    'Use `type()` to ask Python what kind of value something is. Names should be lowercase with underscores, like `first_name`.',
  ], 'Add a variable `is_student = True` and print its type.',
  c('main.py', ['age = 21', 'price = 4.5', 'city = "Chennai"', 'print(type(age), type(price), type(city))'], ["<class 'int'> <class 'float'> <class 'str'>"])),
  4: L(6, '`input()` always gives you text. Convert it with `int()` when you need a number.', [
    'Operators do arithmetic: `+`, `-`, `*`, `/`, `//` (whole division), `%` (remainder) and `**` (power).',
    'Use `input()` to ask the user a question. Because the answer is text, wrap it in `int()` before doing maths with it.',
  ], 'Make the program calculate the area of a rectangle from two inputs.',
  c('main.py', ['a = int("7")', 'b = 3', 'print(a + b, a // b, a % b, a ** b)'], ['10 2 1 343'])),
  5: L(7, 'Lists keep order. Dictionaries keep labels. Pick the one that matches your data.', [
    'A list holds many values in order: `fruits = ["apple", "mango"]`. Count starts at 0, so `fruits[0]` is the first item. Add items with `append()`.',
    'A dictionary stores pairs of key and value, such as a name and an age. Read a value with its key: `person["name"]`.',
  ], 'Add a new key `"city"` to the dictionary and print it.',
  c('main.py', ['fruits = ["apple", "mango"]', 'fruits.append("banana")', 'person = {"name": "Asha", "age": 20}', 'print(len(fruits), fruits[0], person["name"])'], ['3 apple Asha'])),
  6: L(6, 'Indentation is not decoration in Python. It is how Python knows what belongs inside.', [
    'An `if` statement runs code only when a condition is true. Add `elif` for more checks and `else` for everything else.',
    'Compare with `==`, `!=`, `<`, `>`, `<=` and `>=`. Combine conditions with `and`, `or` and `not`. The indented lines under the colon are the block that runs.',
  ], 'Change `score` to 45 and see which message prints.',
  c('main.py', ['score = 72', 'if score >= 80:', '    print("Great")', 'elif score >= 50:', '    print("Pass")', 'else:', '    print("Try again")'], ['Pass'])),
  7: L(6, 'A loop repeats code for you, so you only write it once.', [
    'A `for` loop walks through a sequence one item at a time. `range(3)` gives the numbers 0, 1 and 2, so the loop body runs three times.',
    'You can loop over a list too: `for fruit in fruits:` runs once per item. `range(start, stop)` lets you pick where to begin.',
  ], 'Change 3 to 5. What will the last line say?',
  c('main.py', ['for i in range(3):', '    print("Step", i)'], ['Step 0', 'Step 1', 'Step 2'])),
  8: L(6, 'Always make sure a `while` loop can finish, or it will run forever.', [
    'A `while` loop repeats as long as its condition stays true. Use it when you do not know in advance how many times to repeat.',
    '`break` leaves the loop immediately. `continue` skips to the next round. Remember to change the variable inside the loop so it eventually stops.',
  ], 'Make the loop count down from 5 instead of up to 3.',
  c('main.py', ['n = 0', 'while n < 3:', '    n += 1', '    if n == 2:', '        continue', '    print("n is", n)'], ['n is 1', 'n is 3'])),
  9: L(6, 'If you copy and paste code twice, it probably wants to be a function.', [
    'A function is a named block of code you can reuse. Define it with `def`, then call it by writing its name with brackets.',
    'Functions keep programs short and easy to fix: change the function once and every call gets the update.',
  ], 'Define a function `goodbye()` and call it after `greet()`.',
  c('main.py', ['def greet():', '    print("Hello!")', '', 'greet()', 'greet()'], ['Hello!', 'Hello!'])),
  10: L(7, '`return` hands a value back. `print` only shows it. They are different jobs.', [
    'Parameters let a function receive input: `def add(a, b):`. The values you pass in when calling are called arguments.',
    'Use `return` to send a result back to the caller so you can store it in a variable or use it in more maths.',
  ], 'Write a function `square(n)` that returns n times n.',
  c('main.py', ['def add(a, b):', '    return a + b', '', 'total = add(4, 6)', 'print("Total:", total)'], ['Total: 10'])),
};

const AI: Record<number, LessonContent> = {
  1: L(5, 'Generative AI makes new things; it does not just look things up.', [
    'Generative AI creates new content such as text, images, code or music from a prompt you write. Tools like chat assistants are built on this idea.',
    'It learns patterns from huge amounts of examples. It does not store a list of ready-made answers; it generates a fresh one each time.',
  ], 'Ask an AI tool to explain recycling to a 10 year old, then to a scientist. Compare.',
  c('prompt.txt', ['Explain what a database is in one sentence.'], ['A database is an organised collection of data that', 'a computer can store, search and update quickly.'])),
  2: L(6, 'A model predicts the next piece of text, over and over, very fast.', [
    'A language model breaks text into small pieces called tokens and predicts which token is most likely to come next. Repeating this builds whole sentences.',
    'It was trained on a lot of text, so it picks up grammar, facts and style. A prompt is simply the starting text it continues from.',
  ], 'Guess the next word: "The capital of France is ___". Why is it easy?',
  c('tokens.txt', ['Input : The sky is', 'Next  : blue (62%)  clear (14%)  grey (9%)'], ['Most likely next token: blue'])),
  3: L(6, 'Great at drafting. Not always right. Check the facts that matter.', [
    'Models are strong at summarising, rewriting, brainstorming and explaining. They are fast and never get tired.',
    'They can also state wrong things confidently (called hallucinations), know nothing after their training date and cannot see private files unless you share them.',
  ], 'List two tasks you would trust AI with, and one you would always double-check.',
  c('checklist.txt', ['Use AI for : drafts, ideas, summaries', 'Verify     : numbers, dates, legal, medical'], ['Rule: the more it matters, the more you check.'])),
  4: L(6, 'Vague in, vague out. Say who, what, and how long.', [
    'A good prompt states the task, the audience and the format you want. "Write about dogs" is vague; "Write 3 bullet points about dog care for first-time owners" is specific.',
    'Mention length, tone and any rules. The more clearly you describe the result, the less you need to fix afterwards.',
  ], 'Rewrite "Tell me about Python" into a specific prompt.',
  c('prompt.txt', ['Write 3 bullet points on why beginners', 'should learn Python. Keep each under 12 words.'], ['- Simple, readable syntax', '- Used in web, data and AI', '- Huge community and free resources'])),
  5: L(7, 'Show one example and the model will copy the pattern.', [
    'Give the model a role ("You are a friendly maths tutor"), the context it needs, and one or two examples of the output you want. This is called few-shot prompting.',
    'Examples are often stronger than long descriptions because the model can copy the format exactly.',
  ], 'Add a third example to the prompt, then ask for a new word.',
  c('prompt.txt', ['Turn words into emojis.', 'happy -> 😀', 'rain -> 🌧️', 'pizza ->'], ['🍕'])),
  6: L(6, 'Treat the first answer as a draft. Reply with what to change.', [
    'Prompting is a conversation. If the answer is too long, too formal or off-topic, say exactly what to change and ask again.',
    'Useful follow-ups: "shorter", "use simpler words", "add an example", "give 3 versions". Keep what works and refine the rest.',
  ], 'Take any AI answer and ask for a version in half the length.',
  c('chat.txt', ['You  : Explain APIs.', 'You  : Shorter, and use a restaurant example.'], ['An API is the waiter: you order, it brings the kitchen\'s result.'])),
  7: L(7, 'An API request is a message: who you are, which model, what you want.', [
    'To use AI inside your own app you send an HTTP request to the provider\'s API with your API key, the model name and your prompt. The response contains the generated text.',
    'Keep your API key secret: store it in an environment variable on a server, never inside the app code that users download.',
  ], 'Change the `content` text and think about what the response will say.',
  c('request.js', ['const res = await client.messages.create({', '  model: "model-name",', '  max_tokens: 100,', '  messages: [{ role: "user", content: "Say hi" }],', '});'], ['Hi! How can I help you today?'])),
  8: L(7, 'Every request is separate. You must send the history yourself.', [
    'Chat APIs take a list of messages with roles such as `user` and `assistant`. To keep context you send the earlier messages again each time.',
    'Streaming returns the answer in small chunks so users see words appear sooner. Always handle errors like rate limits and timeouts with a retry or a friendly message.',
  ], 'Add an assistant message to the list so the model remembers it.',
  c('chat.js', ['const messages = [', '  { role: "user", content: "My name is Asha." },', '  { role: "assistant", content: "Nice to meet you, Asha." },', '  { role: "user", content: "What is my name?" },', '];'], ['Your name is Asha.'])),
  9: L(6, 'Never paste private data into a tool you do not trust.', [
    'Models learn from human text, so they can repeat bias and stereotypes. Look out for unfair or one-sided answers and question them.',
    'Protect privacy: do not share passwords, personal IDs, health or company secrets with AI tools unless you know how the data is stored.',
  ], 'Write two things you should never paste into a public AI chat.',
  c('rules.txt', ['Do not share : passwords, ID numbers, secrets', 'Do check      : fairness, sources, tone'], ['Safe use = careful input + critical reading.'])),
  10: L(6, 'You are responsible for what you publish, whoever wrote the first draft.', [
    'Verify important claims with a trusted source before relying on them. Ask the model for sources, then open and read them yourself.',
    'Be open about when AI helped, follow your school or workplace rules and credit original authors. Use AI to help you think, not to stop you thinking.',
  ], 'Pick one AI answer you received and verify one fact in it online.',
  c('verify.txt', ['1. Read the answer', '2. Find two trusted sources', '3. Correct what is wrong'], ['Verified answer ready to use.'])),
};

const WEB: Record<number, LessonContent> = {
  1: L(5, 'Every website you visit is just text files your browser turns into a page.', [
    'When you open a website, your browser asks a server for a file. That file is usually HTML, which describes the content and structure of the page.',
    'CSS then styles it and JavaScript makes it interactive. Together, these three make almost every website.',
  ], 'Change the title text and run it again.',
  c('index.html', ['<!doctype html>', '<html>', '  <head><title>My page</title></head>', '  <body>Hello web!</body>', '</html>'], ['Page title: My page', 'Page shows: Hello web!'])),
  2: L(6, 'Use headings in order, like a book: one h1, then h2 sections.', [
    'Headings go from `h1` (main title) to `h6`. Paragraphs use `p`, links use `a` with an `href`, and images use `img` with `src` and `alt` text.',
    'Always give images an `alt` description so screen readers and slow connections still understand them.',
  ], 'Add a second paragraph and a link to your favourite site.',
  c('index.html', ['<h1>My Blog</h1>', '<p>Welcome to my site.</p>', '<a href="https://example.com">Visit</a>', '<img src="me.jpg" alt="Me smiling">'], ['Shows a heading, a paragraph, a link and a picture.'])),
  3: L(6, 'Use the right element and you get accessibility for free.', [
    'Lists use `ul` (bullets) or `ol` (numbers) with `li` items. Tables use `table`, `tr` rows and `td` cells.',
    'Forms collect input with `form`, `input`, `label` and `button`. Every input needs a `label` so people know what to type.',
  ], 'Add an email input to the form with its own label.',
  c('index.html', ['<ul>', '  <li>HTML</li>', '  <li>CSS</li>', '</ul>', '<form>', '  <label>Name <input name="name"></label>', '  <button>Send</button>', '</form>'], ['Shows a bullet list and a small form.'])),
  4: L(6, 'A selector says WHAT to style. The braces say HOW.', [
    'CSS rules look like `selector { property: value; }`. Select by tag (`p`), class (`.card`) or id (`#hero`).',
    'Set colours with names, hex codes like `#6c67e0` or `rgb()`. Classes are reusable, so prefer them for most styling.',
  ], 'Make the `.card` heading orange.',
  c('style.css', ['body { background: #fafafa; }', 'h1 { color: #6c67e0; }', '.card { border: 1px solid #ddd; }'], ['Page gets a light background and a purple heading.'])),
  5: L(6, 'Every element is a box: content, padding, border, margin.', [
    '`padding` is space inside the border, `margin` is space outside it, and `border` is the line between them.',
    'Set `box-sizing: border-box` so width includes padding and border. It makes sizes far easier to predict.',
  ], 'Increase the padding to 24px and watch the box grow.',
  c('style.css', ['* { box-sizing: border-box; }', '.card {', '  width: 240px;', '  padding: 16px;', '  margin: 12px;', '}'], ['Card is 240px wide including its padding.'])),
  6: L(7, 'Flexbox is a row or column you can align with one line of CSS.', [
    'Add `display: flex` to a container and its children line up in a row. `justify-content` spaces them along the row and `align-items` aligns them across.',
    'Use `gap` for space between items and `flex-wrap: wrap` so items drop to the next line on small screens.',
  ], 'Change `space-between` to `center`.',
  c('style.css', ['.nav {', '  display: flex;', '  justify-content: space-between;', '  align-items: center;', '  gap: 12px;', '}'], ['Logo on the left, menu on the right, centred vertically.'])),
  7: L(6, 'Variables hold values; functions hold steps. Name them clearly.', [
    'JavaScript uses `let` for values that change and `const` for values that do not. Functions group steps you want to reuse.',
    'Use `console.log()` to print values while you are testing. It is your best debugging friend.',
  ], 'Call `double(8)` and print the result.',
  c('app.js', ['const name = "Asha";', 'function double(n) {', '  return n * 2;', '}', 'console.log(name, double(4));'], ['Asha 8'])),
  8: L(7, 'The DOM is the page as JavaScript sees it: a tree you can change.', [
    'Select an element with `document.querySelector()`, then change its text or style. Listen for clicks with `addEventListener`.',
    'This is how buttons, menus and forms react when someone uses your page.',
  ], 'Make the button change the title to your name.',
  c('app.js', ['const btn = document.querySelector("button");', 'btn.addEventListener("click", () => {', '  document.title = "Clicked!";', '});'], ['Click the button -> the title changes to "Clicked!"'])),
  9: L(7, 'Design for the small screen first, then make it bigger.', [
    'Add `<meta name="viewport" content="width=device-width, initial-scale=1">` so phones do not zoom out. Use relative sizes like `%`, `rem` and `max-width`.',
    'A media query applies styles only above a certain width, so your layout can grow from one column to two.',
  ], 'Change the breakpoint from 700px to 900px.',
  c('style.css', ['.grid { display: grid; gap: 12px; }', '@media (min-width: 700px) {', '  .grid { grid-template-columns: 1fr 1fr; }', '}'], ['Phones: one column. Wider screens: two columns.'])),
  10: L(5, 'Publishing is just putting your files where everyone can reach them.', [
    'Static sites can be hosted for free on services such as GitHub Pages, Netlify or Vercel. Push your files, and the host gives you a public link.',
    'Before publishing, check links, test on a phone and give your page a clear title and description.',
  ], 'Write a checklist of three things to test before you publish.',
  c('deploy.sh', ['git add .', 'git commit -m "Publish site"', 'git push origin main'], ['Site live at https://username.github.io/my-site'])),
};

const GIT: Record<number, LessonContent> = {
  1: L(5, 'Think of Git as unlimited undo plus a full diary of your project.', [
    'Version control records every change to your files, who made it and why. You can go back to any earlier version and compare them.',
    'Git works on your computer, so you can save progress offline. GitHub is a website that stores Git projects online so teams can share them.',
  ], 'Think of one project where you wished you could undo a change.',
  c('notes.txt', ['Without Git: report_final_v2_REAL.docx', 'With Git   : one file, full history'], ['Every change is saved with a message.'])),
  2: L(5, 'Tell Git who you are once, and every commit is signed with it.', [
    'Download Git from git-scm.com and check it works with `git --version`. Then set your name and email once.',
    'These details are attached to each commit so teammates know who changed what.',
  ], 'Run the version command on your computer.',
  c('terminal', ['git --version', 'git config --global user.name "Asha"', 'git config --global user.email "asha@example.com"'], ['git version 2.45.0'])),
  3: L(5, '`git init` turns any folder into a repository.', [
    'A repository (repo) is a folder that Git is tracking. Run `git init` inside the folder to start, and `git status` to see what Git notices.',
    'Git stores its data in a hidden `.git` folder. Never delete it unless you want to lose history.',
  ], 'Create a folder, run `git init`, then `git status`.',
  c('terminal', ['mkdir my-project', 'cd my-project', 'git init', 'git status'], ['Initialized empty Git repository', 'On branch main', 'No commits yet'])),
  4: L(6, 'Staging is choosing what goes into the next snapshot.', [
    '`git add` moves changes to the staging area. `git commit` saves a snapshot of everything staged with a message.',
    'Write messages that say what and why, such as "Add login form". Small, frequent commits are easier to review and undo.',
  ], 'Stage one file and commit it with your own message.',
  c('terminal', ['git add index.html', 'git commit -m "Add home page"'], ['[main 3f2a1c9] Add home page', ' 1 file changed, 12 insertions(+)'])),
  5: L(5, 'The log is your project\'s diary. Read it before you start work.', [
    '`git log` lists commits, newest first. Add `--oneline` for a short view. `git diff` shows exactly which lines changed.',
    'Each commit has a short ID, like `3f2a1c9`, that you can use to look at or return to that moment.',
  ], 'Run `git log --oneline` in any project you have.',
  c('terminal', ['git log --oneline'], ['3f2a1c9 Add home page', 'a81d0e2 Add styles', '5c7b9f4 First commit'])),
  6: L(6, 'Branches let you experiment without touching the working version.', [
    'A branch is a separate line of work. `git branch` lists them, `git switch -c name` creates and switches to a new one.',
    'Keep `main` stable and do new work on feature branches such as `feature/login`.',
  ], 'Create a branch called `feature/about`.',
  c('terminal', ['git switch -c feature/login', 'git branch'], ['Switched to a new branch \'feature/login\'', '* feature/login', '  main'])),
  7: L(6, 'Merge brings the work from one branch into another.', [
    'Switch to the branch you want to update (usually `main`), then run `git merge feature-name`. Git combines the histories.',
    'If the branches changed different files or lines, Git merges them automatically.',
  ], 'Merge your feature branch into main.',
  c('terminal', ['git switch main', 'git merge feature/login'], ['Updating 3f2a1c9..b72e5d1', 'Fast-forward', ' login.html | 20 +++++++'])),
  8: L(7, 'A conflict is Git asking you to choose. It is not an error you caused.', [
    'When two branches change the same line, Git cannot decide for you. It marks the file with `<<<<<<<`, `=======` and `>>>>>>>` around both versions.',
    'Open the file, keep the correct lines, delete the markers, then `git add` and `git commit` to finish the merge.',
  ], 'Fix the markers by keeping both lines in your own order.',
  c('index.html', ['<<<<<<< HEAD', '<h1>Welcome</h1>', '=======', '<h1>Hello there</h1>', '>>>>>>> feature/login'], ['Choose one line, remove the markers, then commit.'])),
  9: L(5, 'Push uploads your commits; pull downloads your teammates\' ones.', [
    'Link your local repo to GitHub with `git remote add origin <url>`. Then `git push -u origin main` uploads your commits.',
    'Use `git pull` to get new work from the remote before you start, so you do not fall behind.',
  ], 'Create an empty GitHub repo and push your project to it.',
  c('terminal', ['git remote add origin https://github.com/asha/my-project.git', 'git push -u origin main'], ['Branch \'main\' set up to track \'origin/main\'.'])),
  10: L(6, 'A pull request is a polite way to say: please review and merge my work.', [
    'Push your feature branch, then open a pull request on GitHub. Write what you changed and why, and add screenshots if it is visual.',
    'Reviewers leave comments; you update the branch and the pull request refreshes. When approved, it is merged into main.',
  ], 'Write a short title and description for a change you made.',
  c('terminal', ['git push -u origin feature/login', '# then click "Compare & pull request" on GitHub'], ['Pull request #1 opened: Add login page'])),
};

const SQL: Record<number, LessonContent> = {
  1: L(5, 'A table is a spreadsheet with rules: every row has the same columns.', [
    'A database stores data in tables. A table has columns (the fields, such as name and age) and rows (each record, such as one student).',
    'SQL is the language you use to ask a database for data or to change it.',
  ], 'Imagine a `books` table. List four columns it would need.',
  c('students', ['id | name  | age', ' 1 | Asha  | 20', ' 2 | Ravi  | 22', ' 3 | Meena | 21'], ['3 rows, 3 columns'])),
  2: L(6, 'Define the shape first, then add the data.', [
    '`CREATE TABLE` defines columns and their types. `INSERT INTO` adds a row. Text goes in single quotes.',
    'Choose clear types such as `INTEGER`, `TEXT` and `REAL`, and give each table an `id` column that uniquely identifies rows.',
  ], 'Insert one more student into the table.',
  c('schema.sql', ['CREATE TABLE students (id INTEGER, name TEXT, age INTEGER);', "INSERT INTO students VALUES (1, 'Asha', 20);", "INSERT INTO students VALUES (2, 'Ravi', 22);"], ['Table created. 2 rows inserted.'])),
  3: L(5, '`SELECT *` is fine to explore; name the columns when you build.', [
    '`SELECT` chooses which columns you want and `FROM` says which table. Use `*` for all columns.',
    'Choosing only the columns you need makes results easier to read and faster to load.',
  ], 'Select only the `age` column.',
  c('query.sql', ['SELECT name, age', 'FROM students;'], ['name  | age', 'Asha  | 20', 'Ravi  | 22', 'Meena | 21'])),
  4: L(6, 'WHERE keeps only the rows that make the condition true.', [
    '`WHERE` filters rows with comparisons like `=`, `>`, `<` and `<>`. Combine them with `AND` and `OR`.',
    'Use `LIKE \'A%\'` to match text that starts with A, and `IN (1, 2)` to match a list of values.',
  ], 'Change the age filter to 21.',
  c('query.sql', ['SELECT name FROM students', 'WHERE age > 20;'], ['name', 'Ravi', 'Meena'])),
  5: L(5, 'Without ORDER BY, row order is not guaranteed.', [
    '`ORDER BY` sorts results; add `DESC` for largest first. `LIMIT` returns only the first N rows.',
    'Together they answer questions like "who are the top 3 scorers?".',
  ], 'Show the youngest student only.',
  c('query.sql', ['SELECT name, age FROM students', 'ORDER BY age DESC', 'LIMIT 2;'], ['name  | age', 'Ravi  | 22', 'Meena | 21'])),
  6: L(6, 'A foreign key is simply an id that points to a row in another table.', [
    'A primary key uniquely identifies each row in its table. A foreign key stores another table\'s primary key, linking the two.',
    'For example, an `orders` table has a `student_id` column that points to the `students` table, so you never copy a name twice.',
  ], 'Which column in `orders` would be the foreign key?',
  c('schema.sql', ['CREATE TABLE orders (', '  id INTEGER PRIMARY KEY,', '  student_id INTEGER REFERENCES students(id),', '  item TEXT', ');'], ['orders.student_id links to students.id'])),
  7: L(7, 'INNER JOIN keeps only rows that have a match on both sides.', [
    'A join combines rows from two tables using a matching column. `INNER JOIN` returns only the rows found in both.',
    'Use short table aliases like `s` and `o` so the query stays readable.',
  ], 'Add the order id to the selected columns.',
  c('query.sql', ['SELECT s.name, o.item', 'FROM students s', 'INNER JOIN orders o ON o.student_id = s.id;'], ['name | item', 'Asha | Notebook', 'Ravi | Pen'])),
  8: L(7, 'LEFT JOIN: keep everything from the left table, matched or not.', [
    '`LEFT JOIN` returns every row from the left table. Where there is no match on the right, the columns show `NULL`.',
    'It is perfect for finding things with no matches, like students who have not ordered anything.',
  ], 'Filter to only rows where `o.item IS NULL`.',
  c('query.sql', ['SELECT s.name, o.item', 'FROM students s', 'LEFT JOIN orders o ON o.student_id = s.id;'], ['name  | item', 'Asha  | Notebook', 'Ravi  | Pen', 'Meena | NULL'])),
  9: L(6, 'Aggregate functions turn many rows into one answer.', [
    '`COUNT` counts rows, `SUM` adds a column, `AVG` finds the average, and `MIN` and `MAX` find the smallest and largest.',
    'Combine them with `WHERE` to answer questions such as "how many students are older than 20?".',
  ], 'Find the maximum age instead of the average.',
  c('query.sql', ['SELECT COUNT(*) AS total,', '       AVG(age) AS avg_age', 'FROM students;'], ['total | avg_age', '3     | 21.0'])),
  10: L(7, 'WHERE filters rows before grouping. HAVING filters groups after.', [
    '`GROUP BY` splits rows into groups so aggregates run once per group, such as orders per student.',
    '`HAVING` filters those groups, for example only students with more than one order.',
  ], 'Change HAVING to show students with at least 3 orders.',
  c('query.sql', ['SELECT student_id, COUNT(*) AS orders', 'FROM orders', 'GROUP BY student_id', 'HAVING COUNT(*) > 1;'], ['student_id | orders', '1          | 3'])),
};

const CLOUD: Record<number, LessonContent> = {
  1: L(5, 'The cloud is someone else\'s computer that you rent by the minute.', [
    'Cloud computing means using servers, storage and software over the internet instead of owning hardware. You pay for what you use and can grow or shrink quickly.',
    'Big providers such as AWS, Azure and Google Cloud run huge data centres around the world.',
  ], 'List two apps you use daily that run in the cloud.',
  c('notes.txt', ['Own server : buy, set up, maintain', 'Cloud server : click, use, pay per hour'], ['Faster start, pay only for what you use.'])),
  2: L(6, 'The more the provider manages, the less you have to.', [
    '`IaaS` gives you raw machines and networks. `PaaS` gives you a platform to run your code without managing servers. `SaaS` is a finished app, such as email.',
    'Think of pizza: IaaS is buying ingredients, PaaS is a kit, and SaaS is a delivered pizza.',
  ], 'Classify: Gmail, a virtual machine, a managed database.',
  c('models.txt', ['IaaS : virtual machine', 'PaaS : app hosting platform', 'SaaS : online email'], ['You manage less as you go down the list.'])),
  3: L(5, 'Put your app near your users, and in more than one zone.', [
    'A region is a geographic area with data centres, such as Mumbai or Frankfurt. Each region has several availability zones, which are separate buildings with their own power.',
    'Running across zones keeps your app up if one zone fails. Choosing a nearby region makes it faster for users.',
  ], 'Which region would you pick for users in India?',
  c('regions.txt', ['Region : ap-south-1 (Mumbai)', 'Zones  : 1a, 1b, 1c'], ['App runs in 2 zones for safety.'])),
  4: L(6, 'A container packages your app with everything it needs to run.', [
    'A virtual machine is a full computer simulated on shared hardware. A container is lighter: it packages just your app and its libraries.',
    'Containers start in seconds and run the same on your laptop and in the cloud, which is why teams love them.',
  ], 'Change the exposed port from 3000 to 8080.',
  c('Dockerfile', ['FROM node:20', 'WORKDIR /app', 'COPY . .', 'RUN npm install', 'CMD ["node", "server.js"]'], ['Image built: my-app:1.0'])),
  5: L(6, 'Pick storage by how you will read the data, not just how much you have.', [
    'Object storage (like S3) holds files such as images and backups cheaply. Block storage is a disk for a server. Databases store structured data you can query.',
    'Managed databases handle backups, patches and failover for you, so you can focus on the app.',
  ], 'Where would you store user profile photos? Where would orders go?',
  c('storage.txt', ['photos  -> object storage', 'orders  -> managed database', 'backups -> object storage (cold)'], ['Right store for each kind of data.'])),
  6: L(6, 'A load balancer is a receptionist sending visitors to a free server.', [
    'A virtual network keeps your resources private, with firewalls (security groups) controlling who can connect.',
    'A load balancer spreads incoming traffic across several servers, and removes unhealthy ones, so your app stays fast and available.',
  ], 'What happens to users if one server goes down behind a load balancer?',
  c('network.txt', ['Internet -> Load balancer', '  -> server A', '  -> server B'], ['Traffic is shared between A and B.'])),
  7: L(7, 'Deploy small and often. A fast rollback beats a perfect release.', [
    'Deploying means putting your app on a server so people can use it. Build the app, package it, upload it and start it.',
    'Check the health of the app after each deploy, and keep the previous version handy so you can roll back quickly.',
  ], 'Add a step that runs tests before deploying.',
  c('deploy.sh', ['npm run build', 'docker build -t my-app .', 'docker push registry/my-app:1.0', 'kubectl rollout restart deploy/my-app'], ['Deployment my-app restarted. Healthy: 2/2'])),
  8: L(6, 'HTTPS is not optional. Browsers warn users without it.', [
    'A domain name such as `devly.app` points to your server\'s address through DNS. A certificate enables HTTPS so traffic is encrypted.',
    'Logs record what happened. When something breaks, logs are the first place to look.',
  ], 'Find which log line shows the failed request.',
  c('access.log', ['GET /home 200 31ms', 'GET /api/user 200 54ms', 'GET /api/pay 500 120ms'], ['1 error found: /api/pay returned 500'])),
  9: L(6, 'Set a budget alert on day one. Surprise bills are never fun.', [
    'You pay for compute time, storage, and data leaving the cloud. Idle resources still cost money, so switch off what you do not use.',
    'Use budgets and alerts, tag resources by project and review the bill every month.',
  ], 'Estimate: 2 servers at $0.05 per hour for a 30-day month.',
  c('cost.txt', ['2 servers x $0.05 x 24h x 30d'], ['Estimated cost: $72.00 per month'])),
  10: L(6, 'Give each person and app only the access it needs, nothing more.', [
    'Use identity and access management to control who can do what. Follow least privilege and turn on multi-factor authentication for every account.',
    'Never put secrets in code. Keep them in a secrets manager and rotate them regularly.',
  ], 'Which of these should never be committed to Git: API key, README, password?',
  c('policy.json', ['{ "role": "viewer",', '  "allow": ["read:reports"],', '  "deny": ["delete:*"] }'], ['User can read reports but cannot delete anything.'])),
};

export const LESSONS: Record<string, Record<number, LessonContent>> = {
  py: PYTHON,
  ai: AI,
  web: WEB,
  git: GIT,
  sql: SQL,
  cloud: CLOUD,
};

export function getLessonContent(courseId: string, lesson: number): LessonContent | undefined {
  return LESSONS[courseId]?.[lesson];
}

// ---- Light syntax colouring for the code box ----

const KEYWORDS = new Set([
  // python
  'def', 'return', 'if', 'elif', 'else', 'for', 'while', 'in', 'and', 'or', 'not', 'break', 'continue', 'True', 'False', 'None', 'import', 'from',
  // javascript
  'const', 'let', 'function', 'await', 'async', 'new', 'class',
  // sql
  'SELECT', 'FROM', 'WHERE', 'ORDER', 'BY', 'LIMIT', 'INSERT', 'INTO', 'VALUES', 'CREATE', 'TABLE', 'INNER', 'LEFT', 'JOIN', 'ON', 'GROUP', 'HAVING',
  'AS', 'DESC', 'LIKE', 'IS', 'NULL', 'PRIMARY', 'KEY', 'REFERENCES', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'AND', 'OR', 'INTEGER', 'TEXT',
  // git / shell
  'git', 'docker', 'npm', 'kubectl', 'mkdir', 'cd',
]);

const TOKEN = /("[^"]*"|'[^']*')|(#.*|--.*|\/\/.*)|(<\/?[A-Za-z][\w-]*)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][\w]*)(?=\()|([A-Za-z_]\w*)|(\s+|.)/g;

// Splits one line of code into coloured pieces.
export function highlight(line: string): [string, TokenKind][] {
  const out: [string, TokenKind][] = [];
  for (const m of line.matchAll(TOKEN)) {
    const [text, str, comment, tag, num, fn, word] = m;
    let kind: TokenKind = 'plain';
    if (str) kind = 'str';
    else if (comment) kind = 'plain';
    else if (tag) kind = 'kw';
    else if (num) kind = 'num';
    else if (fn) kind = KEYWORDS.has(fn) ? 'kw' : 'fn';
    else if (word) kind = KEYWORDS.has(word) ? 'kw' : 'plain';
    out.push([text, kind]);
  }
  return out;
}
