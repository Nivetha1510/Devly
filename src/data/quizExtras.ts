// Extra practice questions, merged into each topic by quizzes.ts.
// They give every topic at least 5 questions so the Master Quiz can draw a varied mix.
import { Question } from './learning';

function q(text: string, options: string[], answer: number, explain: string, mono = false): Question {
  return { before: text, options, answer, monoOptions: mono, explain };
}

export const EXTRA_QUIZZES: Record<string, Question[]> = {
  // ---- Python for Beginners ----
  'Getting started': [
    q('Which line prints Hello on the screen in Python?', ['echo "Hello"', 'print("Hello")', 'console.log("Hello")', 'printf Hello'], 1, 'print("Hello") is the Python way to show text. The other forms belong to other languages.', true),
    q('What is the usual file extension of a Python program?', ['.pt', '.python', '.py', '.pyt'], 2, 'Python files end in .py, for example main.py.', true),
  ],
  'Variables and types': [
    q('What is x after running: x = 5 and then x = x + 2?', ['5', '2', '52', '7'], 3, 'x starts as 5, then the second line stores 5 + 2, so x becomes 7.', true),
    q('Which type is the value True?', ['str', 'bool', 'int', 'float'], 1, 'True and False are booleans (bool) in Python.', true),
  ],
  'Loops and iteration': [
    q('How many times does the body of "for i in range(5):" run?', ['4', '6', '5', 'Forever'], 2, 'range(5) produces 0, 1, 2, 3 and 4, which is five values.', true),
    q('Which statement skips the rest of the current loop round and moves on?', ['break', 'continue', 'return', 'stop'], 1, 'continue jumps to the next round of the loop. break ends the loop completely.', true),
  ],
  'Functions': [
    q('What does return do inside a function?', ['Prints a value', 'Repeats the function', 'Sends a value back to the caller and ends the function', 'Creates a loop'], 2, 'return hands a result back to the code that called the function.'),
    q('If add(a, b) returns a + b, what does add(2, 3) give?', ['23', '5', 'None', 'An error'], 1, 'The function adds the numbers and returns 5.', true),
  ],

  // ---- Intro to Generative AI ----
  'What is generative AI?': [
    q('Which of these is an example of generative AI output?', ['Sorting a spreadsheet', 'A newly written short poem', 'Copying a file', 'A calculator result'], 1, 'Generative AI creates new content such as text, images or code.'),
    q('What is a prompt?', ['The model\'s training data', 'The text you give a model to respond to', 'A type of error', 'A password'], 1, 'A prompt is the input, such as a question or instruction, that the model continues from.'),
  ],
  'Writing great prompts': [
    q('What does giving a role like "You are a maths tutor" do?', ['Makes the model smaller', 'Guides the tone and style of the answer', 'Makes it free', 'Deletes the context'], 1, 'A role sets the perspective and style the model should answer in.'),
    q('Which detail most improves a prompt asking for a summary?', ['Writing in capitals', 'Adding emojis', 'Stating the length and the audience', 'Repeating the question'], 2, 'Length and audience tell the model exactly what kind of summary you need.'),
  ],
  'Building with an AI API': [
    q('What is a max-tokens setting usually used for?', ['Limiting how long the response can be', 'Hiding the API key', 'Choosing the language', 'Setting the price'], 0, 'It caps how many tokens the model may generate in the answer.'),
    q('How does a chat API usually "remember" earlier messages?', ['It remembers automatically forever', 'You send the earlier messages again in each request', 'It reads your browser history', 'It cannot use earlier messages at all'], 1, 'Each request is separate, so your app includes the conversation history it wants the model to use.'),
  ],
  'Using AI responsibly': [
    q('Why can an AI answer show bias?', ['The model learned from human-written data that contains bias', 'The internet is slow', 'Computers dislike some topics', 'Bias is added by your keyboard'], 0, 'Training data reflects human views and stereotypes, which models can repeat.'),
    q('What is a good habit before acting on an important AI answer?', ['Trust the first answer', 'Check it against reliable sources', 'Ask for a longer answer', 'Remove all context'], 1, 'Verifying important claims with trusted sources protects you from mistakes.'),
  ],

  // ---- Web Foundations ----
  'HTML structure': [
    q('Which tag creates a hyperlink?', ['<link>', '<href>', '<a>', '<url>'], 2, 'The <a> (anchor) tag with an href attribute makes a link.', true),
    q('Where does the visible content of an HTML page go?', ['<head>', '<body>', '<meta>', '<title>'], 1, 'Everything shown in the browser window lives inside <body>.', true),
  ],
  'Styling with CSS': [
    q('How do you select elements with class="card" in CSS?', ['#card', 'card', '.card', '*card'], 2, 'A dot selects by class name, and a hash selects by id.', true),
    q('Which property adds space inside an element, between its content and its border?', ['margin', 'padding', 'gap', 'outline'], 1, 'Padding is inside the border. Margin is outside it.', true),
  ],
  'JavaScript basics': [
    q('What does console.log("hi") do?', ['Shows an alert box', 'Creates a variable', 'Prints hi to the console', 'Saves a file'], 2, 'console.log writes values to the developer console, which is handy for debugging.', true),
    q('Which is a correct function definition in JavaScript?', ['def greet():', 'function greet() {}', 'func greet() {}', 'greet = function:'], 1, 'JavaScript uses the function keyword followed by a name and a body in braces.', true),
  ],
  'Your first website': [
    q('Which browser tool lets you inspect a page\'s HTML and CSS?', ['Developer tools', 'Task manager', 'Notepad', 'Bookmarks'], 0, 'Developer tools (Inspect) show the page structure, styles and console.'),
    q('What should you do before publishing a site?', ['Delete the CSS', 'Test links and the mobile layout', 'Remove the page title', 'Disable images'], 1, 'Testing links and small screens catches the most common problems.'),
  ],

  // ---- Git and GitHub Essentials ----
  'Why version control': [
    q('What is a commit?', ['A remote server', 'A branch name', 'A saved snapshot of your changes in history', 'A text editor'], 2, 'A commit records a snapshot of the staged changes with a message.'),
    q('Can you use Git without an internet connection?', ['No, never', 'Yes, commits are stored locally', 'Only with GitHub open', 'Only on Linux'], 1, 'Git stores history on your own computer, so you only need the internet to share it.'),
  ],
  'Commits and history': [
    q('Which command shows changed files that are not committed yet?', ['git clone', 'git init', 'git status', 'git remote'], 2, 'git status lists modified, staged and untracked files.', true),
    q('What does git add do?', ['Uploads to GitHub', 'Stages changes for the next commit', 'Deletes files', 'Creates a branch'], 1, 'git add moves changes into the staging area so they go into the next commit.', true),
  ],
  'Branches and merges': [
    q('What does git switch -c feature do?', ['Deletes feature', 'Merges feature', 'Creates a new branch called feature and switches to it', 'Clones feature'], 2, '-c means create. The command makes the branch and moves you onto it.', true),
    q('Which command combines another branch into the one you are on?', ['git merge', 'git log', 'git add', 'git fetch'], 0, 'git merge <branch> brings that branch\'s commits into your current branch.', true),
  ],
  'Pull requests': [
    q('What does git push do?', ['Downloads changes', 'Uploads your commits to the remote', 'Creates a repository', 'Deletes a branch'], 1, 'git push sends your local commits to the remote, such as GitHub.', true),
    q('Why write a clear pull request description?', ['It makes the code faster', 'Reviewers can see what changed and why', 'GitHub requires emojis', 'It hides conflicts'], 1, 'A clear description helps reviewers understand and approve your change sooner.'),
  ],

  // ---- SQL and Databases ----
  'Tables and rows': [
    q('What is a column in a table?', ['A single record', 'A database', 'A named field that holds one kind of value', 'A query'], 2, 'Columns define the fields, such as name or age. Rows are the records.'),
    q('Which statement creates a new table?', ['MAKE TABLE', 'NEW TABLE', 'ADD TABLE', 'CREATE TABLE'], 3, 'CREATE TABLE defines a new table and its columns.', true),
  ],
  'SELECT and WHERE': [
    q('Which query returns users older than 18?', ['SELECT * FROM users WHERE age > 18;', 'SELECT * FROM users IF age > 18;', 'FIND users age > 18;', 'SELECT age > 18 FROM users;'], 0, 'WHERE filters rows, and age > 18 is the condition.', true),
    q('Which clause returns only the first 5 rows?', ['TOP5', 'FIRST 5', 'LIMIT 5', 'MAX 5'], 2, 'LIMIT 5 restricts the result to five rows.', true),
  ],
  'Joining tables': [
    q('What does the ON part of a JOIN say?', ['How to sort the result', 'Which columns should match between the tables', 'Which rows to delete', 'How many rows to count'], 1, 'ON gives the matching condition, such as orders.user_id = users.id.'),
    q('After a LEFT JOIN, what appears for left rows with no match?', ['0', 'An empty table', 'NULL', 'An error'], 2, 'Unmatched right-side columns are filled with NULL.'),
  ],
  'Grouping and totals': [
    q('Which query counts users in each country?', ['SELECT country, COUNT(*) FROM users GROUP BY country;', 'SELECT COUNT(country) FROM users ORDER;', 'COUNT users BY country;', 'SELECT country FROM users COUNT;'], 0, 'GROUP BY country makes one group per country, and COUNT(*) counts rows in each.', true),
    q('What does SUM(amount) return?', ['The number of rows', 'The biggest amount', 'The first amount', 'The total of the amount values'], 3, 'SUM adds up all the values in the column.', true),
  ],

  // ---- Cloud Fundamentals ----
  'What is the cloud?': [
    q('What is an availability zone?', ['A billing account', 'An isolated data-centre location inside a region', 'A type of file', 'A web browser'], 1, 'Zones are separate locations inside a region, so one failure does not take down everything.'),
    q('What is SaaS?', ['Raw virtual machines', 'Software you use online that the provider manages', 'A programming language', 'A network cable'], 1, 'Software as a Service is a finished application, such as online email.'),
  ],
  'Compute and storage': [
    q('What is a key advantage of containers?', ['They package an app so it runs the same everywhere', 'They replace the internet', 'They never need updates', 'They only store images'], 0, 'A container bundles the app and its dependencies, so it behaves the same on any machine.'),
    q('Which is best when you want a database that the provider looks after for you?', ['A DNS record', 'A load balancer', 'An image file', 'A managed database service'], 3, 'Managed databases handle backups, patching and failover for you.'),
  ],
  'Deploying an app': [
    q('What does HTTPS give you?', ['An encrypted connection between browser and server', 'More storage', 'Free hosting', 'A faster processor'], 0, 'HTTPS encrypts traffic so others cannot read or change it on the way.'),
    q('Where should you look first when a deployed app misbehaves?', ['The logo', 'The logs', 'The billing page', 'The colour theme'], 1, 'Logs record what the app and servers did, so they usually show what went wrong.'),
  ],
  'Costs and security': [
    q('Why turn on multi-factor authentication?', ['It makes servers faster', 'It adds a second proof of identity beyond the password', 'It lowers storage cost', 'It removes logs'], 1, 'A second factor stops most attacks that only have a stolen password.'),
    q('What is a sensible way to cut the cost of an unused test server?', ['Add more memory', 'Open all ports', 'Ignore it', 'Stop or delete it'], 3, 'Resources you no longer need should be stopped or deleted so you stop paying for them.'),
  ],
};
