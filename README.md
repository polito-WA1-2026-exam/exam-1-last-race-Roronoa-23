# Exam #N: "Last Race"
## Student: s360284 CENTRELLA ANDREA

## React Client Application Routes

- Route `/`: page content and purpose
- Route `/something/:param`: page content and purpose, param specification
- ...

## API Server

- POST `/api/something`
  - request parameters and request body content
  - response body content
- GET `/api/something`
  - request parameters
  - response body content
- POST `/api/something`
  - request parameters and request body content
  - response body content
- ...

## Database Tables

- **Table `users`** - contains the registered users of the application. Each user has an `id`, a `username`, and a `password_hash`. The plain password is never stored in the database.

- **Table `stations`** - contains all the stations of the transport network. Each station has an `id` and a `name`.

- **Table `lines`** - contains the metro lines available in the game. Each line has an `id`, a `name`, and a `color`, used by the frontend to draw the setup map.

- **Table `line_stations`** - contains the ordered list of stations belonging to each line. It connects `lines` and `stations` and stores the `position` of each station inside the line.

- **Table `segments`** - contains the physical connections between two stations. Each segment connects `station1_id` and `station2_id`.

- **Table `line_segments`** - connects each line with the physical segments that belong to it. This allows the same segment to be associated with one or more lines if needed.

- **Table `events`** - contains the possible random events that can happen during route execution. Each event has a `description`, an `effect` on the number of coins, and an `icon_filename` used by the frontend to display the corresponding event icon.

- **Table `games`** - contains the games created by logged-in users. Each game stores the user, the start station, the destination station, the initial number of coins, the final score, the game status, and timestamps for creation and completion.

- **Table `game_steps`** - contains the execution steps of a completed game. Each step stores the selected segment, the movement from one station to another, the random event applied, and the number of coins after that step.

## Database Population

- The **SQLite database** - was populated **manually** from the terminal,   inside the **SQLite shell**, SQL INSERT statements were used to populate the initial data, including users, stations, lines, segments, events, and some completed games for the ranking.

- **User passwords** - are not stored in plain text. Before inserting users into the database, passwords were hashed **using bcrypt**. For example, the following Node.js command was used to generate a password hash:

`node -e "import bcrypt from 'bcrypt'; const hash = await bcrypt.hash('lombax', 10); console.log(hash);`**

The generated hash was then inserted into the password_hash column of the users table. During login, Passport.js receives the plain password entered by the user and verifies it using bcrypt.compare. This function compares the plain password with the stored password_hash and returns whether they match.

## Main React Components

- `ListOfSomething` (in `List.js`): component purpose and main functionality
- `GreatButton` (in `GreatButton.js`): component purpose and main functionality
- ...

(only _main_ components, minor ones may be skipped)

## Screenshot

![Game Screenshot](./screenshots/Game_Screenshot.png)
![Ranking Screenshot](./screenshots/Ranking_Screenshot.png)

## Users Credentials

- **Ratchet** — password: `lombax`
- **Clank** — password: `robot`
- **Qwark** — password: `capitano`

## Use of AI Tools
Briefly describe whether you used any AI tools (e.g., ChatGPT, GitHub Copilot, Claude) while working on this project, for which purposes (e.g., clarifying concepts, debugging, generating code), and how you verified or adapted their output.
If you did not use any AI tools, simply state so.
