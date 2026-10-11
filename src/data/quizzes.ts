// Practice quizzes, one set of questions per course module (topic).
// Keyed by module title (titles are unique across the catalogue).
import { Course } from './courses';
import { Question, QUIZ } from './learning';
import { EXTRA_QUIZZES } from './quizExtras';

// Short builder: question text, four options, index of the right option, short concept note.
function q(text: string, options: string[], answer: number, explain: string, mono = false): Question {
  return { before: text, options, answer, monoOptions: mono, explain };
}

const QUIZZES: Record<string, Question[]> = {
  // ---- Python for Beginners ----
  'Getting started': [
    q('Which function shows text on the screen in Python?', ['echo()', 'print()', 'show()', 'write()'], 1, 'print() sends a value to the screen. It is the first function most Python programmers learn.', true),
    q('What does a line starting with # do?', ['Runs a command', 'Imports a module', 'Is a comment Python ignores', 'Ends the program'], 2, 'A # starts a comment. Python skips it, so you can leave notes for people reading the code.'),
    q('How does Python know which lines belong inside a block?', ['Curly braces', 'Indentation', 'Semicolons', 'Parentheses'], 1, 'Python uses indentation (spaces at the start of a line) to group code into blocks.'),
  ],
  'Variables and types': [
    q('What type is the value 3.14?', ['int', 'str', 'float', 'bool'], 2, 'Numbers with a decimal point are floats. Whole numbers are ints.', true),
    q('What does int("7") return?', ['"7"', '7', '7.0', 'An error'], 1, 'int() converts the text "7" into the whole number 7.', true),
    q('Which is a valid variable name?', ['2nd_place', 'my-score', 'total_score', 'class name'], 2, 'Names can use letters, digits and underscores, but cannot start with a digit or contain spaces or dashes.', true),
  ],
  'Loops and iteration': QUIZ,
  'Functions': [
    q('Which keyword defines a function?', ['func', 'define', 'def', 'function'], 2, 'def starts a function definition, followed by the name and parameters.', true),
    q('What does a function give back when it has no return statement?', ['0', 'An empty string', 'None', 'An error'], 2, 'Without return, a function gives back None, Python\'s "nothing" value.'),
    q('What is a parameter?', ['A value returned by a function', 'A name for an input a function accepts', 'A type of loop', 'A comment'], 1, 'Parameters are the named inputs in a function definition. The values you pass in are arguments.'),
  ],

  // ---- Intro to Generative AI ----
  'What is generative AI?': [
    q('What does a language model do at its core?', ['Searches the web', 'Predicts the next token', 'Stores facts in a table', 'Translates code to hardware'], 1, 'Language models generate text by repeatedly predicting the most likely next token.'),
    q('What is a hallucination?', ['A slow response', 'A confident but incorrect answer', 'A blocked request', 'A long prompt'], 1, 'Models can produce fluent text that is wrong. Always verify important facts.'),
    q('What is a token?', ['A password', 'A chunk of text the model reads', 'A type of prompt', 'A payment unit only'], 1, 'Tokens are small pieces of text (words or parts of words) that models read and write.'),
  ],
  'Writing great prompts': [
    q('Which prompt is most likely to give a useful answer?', ['Tell me about dogs', 'Write a 3-sentence summary of dog care for new owners', 'Dogs?', 'Explain everything'], 1, 'Specific prompts with a clear task, length and audience give more reliable results.'),
    q('Why add an example to a prompt?', ['To make it longer', 'To show the format you expect', 'To lower cost', 'To hide the task'], 1, 'Examples show the model the style and format you want in the answer.'),
    q('What should you do if the first answer is not right?', ['Give up', 'Refine the prompt and try again', 'Repeat it exactly', 'Switch off the model'], 1, 'Prompting is iterative. Add detail or constraints and try again.'),
  ],
  'Building with an AI API': [
    q('Where should an API key be stored?', ['In the app source code', 'On a secure server or environment variable', 'In a public repo', 'In the page title'], 1, 'Keys are secrets. Keep them in environment variables or on a server, never in public code.'),
    q('What does streaming a response do?', ['Sends it as it is generated', 'Compresses it', 'Saves it to disk', 'Translates it'], 0, 'Streaming sends tokens as they are produced, so users see text appear quickly.'),
    q('What is a good response to an API error like a rate limit?', ['Retry immediately forever', 'Wait and retry with backoff', 'Ignore it', 'Delete the key'], 1, 'Back off and retry after a delay so you do not hit the limit again.'),
  ],
  'Using AI responsibly': [
    q('Why should you check AI-generated facts?', ['They are always right', 'Models can be wrong or outdated', 'It is required by law everywhere', 'To save tokens'], 1, 'AI output can contain mistakes, so verify anything important.'),
    q('What should you avoid putting in a prompt?', ['A greeting', 'Private personal data', 'A question', 'An example'], 1, 'Do not share sensitive personal data with tools unless you know how it is stored and used.'),
    q('What is prompt injection?', ['A faster prompt', 'Hidden text that tries to override instructions', 'A type of API key', 'A formatting trick'], 1, 'Untrusted input can contain instructions that try to hijack the model, so treat it carefully.'),
  ],

  // ---- Web Foundations ----
  'HTML structure': [
    q('Which tag creates the largest heading?', ['<h6>', '<head>', '<h1>', '<title>'], 2, '<h1> is the top-level heading. <h6> is the smallest.', true),
    q('Which attribute describes an image for screen readers?', ['src', 'alt', 'href', 'title'], 1, 'alt text describes the image for people using screen readers and when the image fails to load.', true),
    q('Which element is best for site navigation links?', ['<div>', '<span>', '<nav>', '<p>'], 2, '<nav> is a semantic element that marks navigation, which helps accessibility.', true),
  ],
  'Styling with CSS': [
    q('Which property changes text colour?', ['font-color', 'text-style', 'color', 'foreground'], 2, 'color sets the text colour in CSS.', true),
    q('What is the order of the box model from inside out?', ['Content, padding, border, margin', 'Margin, border, padding, content', 'Content, margin, border, padding', 'Padding, content, border, margin'], 0, 'The box is content, then padding, then border, then margin.'),
    q('Which value makes a flex container lay items in a row?', ['display: flex', 'display: block', 'position: fixed', 'float: row'], 0, 'display: flex turns on flexbox, which lays children in a row by default.', true),
  ],
  'JavaScript basics': [
    q('Which keyword declares a variable that cannot be reassigned?', ['var', 'let', 'const', 'set'], 2, 'const creates a binding that cannot be reassigned.', true),
    q('What does === check?', ['Value only', 'Value and type', 'Type only', 'Assignment'], 1, '=== is strict equality: both the value and the type must match.', true),
    q('Which method adds an item to the end of an array?', ['push()', 'pop()', 'shift()', 'add()'], 0, 'push() appends to the end. pop() removes the last item.', true),
  ],
  'Your first website': [
    q('Which file is usually the home page of a site?', ['home.css', 'index.html', 'main.js', 'site.txt'], 1, 'Web servers serve index.html by default for a folder.', true),
    q('Which meta tag helps a page fit mobile screens?', ['charset', 'description', 'viewport', 'author'], 2, 'The viewport meta tag tells phones how to scale the page.'),
    q('What is the main reason to test in several browsers?', ['Browsers render slightly differently', 'It is faster', 'To change the code', 'To add images'], 0, 'Browsers can differ in small ways, so testing finds layout and behaviour bugs.'),
  ],

  // ---- Git and GitHub Essentials ----
  'Why version control': [
    q('What is the main benefit of version control?', ['Faster internet', 'Tracking and reverting changes', 'Smaller files', 'Free hosting'], 1, 'Version control records history so you can compare, restore and collaborate safely.'),
    q('What is the difference between Git and GitHub?', ['They are the same', 'Git is the tool, GitHub hosts repositories', 'GitHub is the tool, Git hosts them', 'Git is only for Windows'], 1, 'Git is the version control system. GitHub is a service for hosting Git repositories.'),
    q('What is a repository?', ['A text editor', 'A project folder with its history', 'A type of branch', 'A password'], 1, 'A repository holds your project files and their full history.'),
  ],
  'Commits and history': [
    q('Which command saves staged changes to history?', ['git add', 'git commit', 'git push', 'git status'], 1, 'git commit records the staged changes as a new snapshot.', true),
    q('What makes a good commit message?', ['"stuff"', 'A short description of what and why', 'A whole essay', 'Just your name'], 1, 'Clear, short messages make history useful to others and your future self.'),
    q('Which command shows commit history?', ['git log', 'git diff', 'git init', 'git fetch'], 0, 'git log lists previous commits with authors, dates and messages.', true),
  ],
  'Branches and merges': [
    q('Why use a branch?', ['To delete history', 'To work without affecting main', 'To speed up your PC', 'To rename files'], 1, 'Branches let you work on a change in isolation and merge when it is ready.'),
    q('What is a merge conflict?', ['A network error', 'Two changes touching the same lines', 'A missing file', 'A wrong password'], 1, 'Conflicts happen when Git cannot combine edits to the same part of a file automatically.'),
    q('Which command switches to an existing branch?', ['git switch', 'git merge', 'git clone', 'git stash'], 0, 'git switch <name> moves you to another branch.', true),
  ],
  'Pull requests': [
    q('What is a pull request?', ['A request to download code', 'A proposal to merge your changes, open for review', 'A bug report', 'A branch name'], 1, 'A pull request asks maintainers to review and merge your branch.'),
    q('What is a fork?', ['A copy of a repository under your account', 'A deleted branch', 'A commit message', 'A tag'], 0, 'A fork is your own copy of someone else\'s repository, where you can make changes.'),
    q('What should you do after receiving review feedback?', ['Ignore it', 'Push updates to the same branch', 'Close the PR', 'Delete the repo'], 1, 'Push new commits to the same branch and the pull request updates automatically.'),
  ],

  // ---- SQL and Databases ----
  'Tables and rows': [
    q('What is a primary key?', ['A column that uniquely identifies each row', 'The first column', 'A password', 'A sorted column'], 0, 'A primary key is a column (or set) whose value is unique for every row.'),
    q('Which statement adds a new row?', ['SELECT', 'INSERT', 'UPDATE', 'CREATE'], 1, 'INSERT INTO adds a new row to a table.', true),
    q('What does NULL mean?', ['Zero', 'An empty string', 'No value / unknown', 'False'], 2, 'NULL means a missing or unknown value. It is not the same as zero or an empty string.'),
  ],
  'SELECT and WHERE': [
    q('Which clause filters rows?', ['ORDER BY', 'WHERE', 'GROUP BY', 'LIMIT'], 1, 'WHERE keeps only the rows that match a condition.', true),
    q('What does SELECT * return?', ['Only the first column', 'All columns', 'Row count', 'Nothing'], 1, '* means every column in the table.', true),
    q('Which clause sorts results?', ['SORT', 'ORDER BY', 'ARRANGE', 'GROUP BY'], 1, 'ORDER BY sorts the result, ascending by default.', true),
  ],
  'Joining tables': [
    q('What does INNER JOIN return?', ['All rows from both tables', 'Only rows with matches in both tables', 'Only the left table', 'Only unmatched rows'], 1, 'INNER JOIN keeps rows where the join condition matches in both tables.'),
    q('Which join keeps all rows from the left table?', ['INNER JOIN', 'LEFT JOIN', 'CROSS JOIN', 'NATURAL JOIN'], 1, 'LEFT JOIN keeps every left row and fills NULL where there is no match.', true),
    q('What is a foreign key?', ['A key from another country', 'A column that references another table\'s key', 'A duplicate row', 'An index name'], 1, 'A foreign key links a row to a row in another table.'),
  ],
  'Grouping and totals': [
    q('Which function counts rows?', ['SUM()', 'COUNT()', 'AVG()', 'TOTAL()'], 1, 'COUNT() returns the number of rows (or non-null values).', true),
    q('Which clause filters groups after GROUP BY?', ['WHERE', 'HAVING', 'LIMIT', 'DISTINCT'], 1, 'WHERE filters rows before grouping. HAVING filters the groups afterwards.', true),
    q('What does AVG(price) return?', ['The total price', 'The highest price', 'The mean price', 'The number of prices'], 2, 'AVG() returns the arithmetic mean of the values.'),
  ],

  // ---- Cloud Fundamentals ----
  'What is the cloud?': [
    q('What does "pay-as-you-go" mean?', ['Pay once forever', 'Pay only for what you use', 'Pay monthly regardless of use', 'Pay with cash'], 1, 'Cloud providers charge based on the resources you actually consume.'),
    q('Which model gives you virtual servers to manage yourself?', ['SaaS', 'PaaS', 'IaaS', 'DaaS'], 2, 'IaaS (Infrastructure as a Service) provides raw compute, storage and networks.'),
    q('What is a region?', ['A user account', 'A geographic area with data centres', 'A billing plan', 'A type of server'], 1, 'Regions are separate geographic locations where a provider runs data centres.'),
  ],
  'Compute and storage': [
    q('Which service runs code without managing servers?', ['Virtual machine', 'Serverless function', 'Block disk', 'DNS'], 1, 'Serverless functions run your code on demand and scale automatically.'),
    q('What is object storage best for?', ['Running databases', 'Files like images and backups', 'Operating systems', 'Network routing'], 1, 'Object storage holds large amounts of unstructured data such as media and backups.'),
    q('What does a load balancer do?', ['Stores data', 'Spreads traffic across servers', 'Encrypts disks', 'Compiles code'], 1, 'A load balancer shares incoming requests across several servers to stay fast and available.'),
  ],
  'Deploying an app': [
    q('Where should secrets like database passwords live?', ['In the code', 'In environment variables or a secret manager', 'In the README', 'In the URL'], 1, 'Keep secrets out of code. Use environment variables or a secrets service.'),
    q('What is a container image?', ['A photo', 'A packaged app with its dependencies', 'A backup', 'A log file'], 1, 'An image bundles your app and everything it needs so it runs the same everywhere.'),
    q('What should you do if a deployment goes wrong?', ['Wait', 'Roll back to the last working version', 'Delete the cloud account', 'Disable HTTPS'], 1, 'Rolling back restores the previous working release quickly.'),
  ],
  'Costs and security': [
    q('What does least privilege mean?', ['Give everyone admin', 'Give only the access that is needed', 'Remove all access', 'Share one account'], 1, 'Grant the minimum permissions required, which limits the damage from mistakes or attacks.'),
    q('How can you avoid surprise cloud bills?', ['Ignore usage', 'Set budgets and alerts', 'Use only one region', 'Disable logging'], 1, 'Budgets and alerts warn you before costs get out of hand.'),
    q('What does encryption in transit protect?', ['Data stored on disk', 'Data moving over the network', 'Passwords in notes', 'Backups only'], 1, 'Encryption in transit (like HTTPS) protects data while it travels between systems.'),
  ],
};

// All questions for one topic (module title): the core set plus the extras.
export function getQuiz(title: string): Question[] {
  return [...(QUIZZES[title] ?? []), ...(EXTRA_QUIZZES[title] ?? [])];
}

export function quizCount(course: Course): number {
  return course.modules.reduce((n, m) => n + getQuiz(m.title).length, 0);
}
