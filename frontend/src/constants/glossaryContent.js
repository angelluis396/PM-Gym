// ─── Glossary content ─────────────────────────────────────────────────────────
// Each category has a key, label, emoji, and array of terms.
// Each term has a name, definition, example, and optional tip.

export const GLOSSARY = [
  {
    key:   "foundation",
    label: "Product Foundation",
    emoji: "🏗️",
    terms: [
      {
        name: "Product Vision",
        definition:
          "A short, inspiring statement that describes what a product aims to achieve in the long term. It answers 'why does this product exist?' and serves as the north star for all product decisions.",
        example:
          "For busy parents who struggle to find healthy recipes, MealMate is a mobile app that delivers personalized weekly meal plans in under 60 seconds. Unlike generic recipe sites, MealMate learns your family's preferences and automatically generates a grocery list.",
        tip: "A good product vision should be ambitious enough to inspire but specific enough to guide. If it could apply to any product, it's too vague.",
      },
      {
        name: "Target Group",
        definition:
          "The specific segment of users your product is designed for. A well-defined target group goes beyond demographics to include behaviors, motivations, pain points, and context of use.",
        example:
          "Not just 'working professionals aged 25-40' but 'mid-level managers at tech companies who spend 3+ hours per week in unproductive meetings and feel overwhelmed by their task backlog.'",
        tip: "The more specific your target group, the easier it is to make product decisions. If you're building for everyone, you're building for no one.",
      },
      {
        name: "User Needs",
        definition:
          "The underlying problems, goals, or frustrations that motivate a user to seek a solution. User needs are distinct from feature requests — they describe the 'why' behind what users ask for.",
        example:
          "A user asking for a 'dark mode' has an underlying need to reduce eye strain when working at night. The need is comfort and reduced fatigue, not the dark mode itself.",
        tip: "Always ask 'why?' at least three times when a user requests a feature. You'll almost always uncover the real need underneath.",
      },
      {
        name: "Value Proposition",
        definition:
          "A clear statement of the tangible benefit your product delivers to users and why it is better than alternatives. It connects user needs to your product's unique capabilities.",
        example:
          "Slack's value proposition: 'Replace email for team communication, making collaboration faster and more searchable, unlike email threads that get buried and lost.'",
        tip: "A strong value proposition is specific about who benefits, what they gain, and what they gain it instead of. Avoid vague claims like 'save time and money.'",
      },
      {
        name: "Key Features",
        definition:
          "The core capabilities of a product that directly deliver value to users and differentiate it from competitors. Key features are the 'what' of your product — the specific things users can do.",
        example:
          "For a project management app: task assignment with due dates, real-time team notifications, Kanban board view, time tracking, and automated weekly progress reports.",
        tip: "Keep your key features list focused. If everything is a key feature, nothing is. Ask: which 3-5 features would users miss most if they disappeared tomorrow?",
      },
      {
        name: "MVP (Minimum Viable Product)",
        definition:
          "The simplest version of a product that delivers enough value to early users to validate core assumptions, gather feedback, and justify further investment — without building everything at once.",
        example:
          "Dropbox's MVP was a demo video showing how the product would work before any code was written. It validated demand without building the full product.",
        tip: "An MVP is not a low-quality product. It's a focused product that tests your riskiest assumptions with the least amount of effort.",
      },
    ],
  },
  {
    key:   "planning",
    label: "Planning & Roadmapping",
    emoji: "🗺️",
    terms: [
      {
        name: "Product Roadmap",
        definition:
          "A high-level visual plan that shows the direction of a product over time, organized by themes or time periods (quarters, releases). It communicates priorities and trade-offs to stakeholders without committing to exact dates.",
        example:
          "Q1: Core login and onboarding. Q2: Free class schedule viewing. Q3: Paid class registration and trainer chat. Q4: Motivational notifications and member dashboard.",
        tip: "A roadmap is a living document, not a contract. Set expectations with stakeholders that items may shift as you learn more from users and the market.",
      },
      {
        name: "Release Plan",
        definition:
          "A more detailed plan that breaks the roadmap into specific, shippable releases. Each release has a defined set of user-facing outcomes expressed as 'User can...' statements.",
        example:
          "Release 1: User can download the app, create a login, set a default club location, and view contact info and hours. Release 2: User can view free class schedules by date, time, and instructor.",
        tip: "Each release should deliver standalone value to users — not just be a chunk of features. Ask: what can the user do after this release that they couldn't before?",
      },
      {
        name: "Go-to-Market Strategy",
        definition:
          "The plan for how a product or feature will be launched to users, including target audience, messaging, channels, pricing, and success metrics. It bridges product and business strategy.",
        example:
          "Launch to power users in beta first, gather testimonials, then use those testimonials in a Product Hunt launch targeting early adopters, followed by a paid acquisition campaign targeting the broader ICP.",
        tip: "GTM strategy should be defined before development is complete, not after. Distribution is as important as the product itself.",
      },
    ],
  },
  {
    key:   "agile",
    label: "Agile & Delivery",
    emoji: "⚙️",
    terms: [
      {
        name: "Themes",
        definition:
          "The highest level of the agile hierarchy — broad strategic areas of focus that group related features, epics, and stories together. Themes typically map to business goals or product pillars.",
        example:
          "For a fitness app, themes might be: Member Engagement, Club Connectivity, Trainer Relationships, and Health Motivation.",
        tip: "Themes help you communicate strategy to executives without getting into feature-level detail. Think of them as the chapters of your product story.",
      },
      {
        name: "Epics",
        definition:
          "A large body of work that represents a significant user capability. Epics are too big to complete in a single sprint and are broken down into smaller user stories. They typically follow the format: 'As a [user], I need to [action], so I can [outcome].'",
        example:
          "As a fitness club member, I need to be able to view group fitness schedules at my club, so I can decide if I want to attend a class.",
        tip: "An epic should represent a meaningful user outcome, not just a feature. If you can't articulate the user benefit, the epic needs more definition.",
      },
      {
        name: "User Stories",
        definition:
          "Small, specific units of work that describe a single user interaction or need. They follow the format: 'As a [user], I need to [specific action], so I can [outcome].' Stories should be completable within a single sprint.",
        example:
          "As a fitness club member, I need to view free cycle classes remaining today at my default club, so I can decide if I want to go this evening.",
        tip: "Good user stories follow the INVEST criteria: Independent, Negotiable, Valuable, Estimable, Small, and Testable. If a story fails any of these, it needs refinement.",
      },
      {
        name: "Backlog",
        definition:
          "A prioritized list of all work to be done on a product — including epics, user stories, bugs, and technical tasks. The product backlog is owned by the PM and continuously refined based on user feedback and business priorities.",
        example:
          "A backlog might contain: 50 user stories across 8 epics, 12 bug fixes, 3 technical debt items, and 2 UX improvement tasks — all ranked by priority.",
        tip: "A healthy backlog is pruned regularly. Items that haven't been prioritized in 3+ months should be deleted or archived — they're cluttering your thinking.",
      },
      {
        name: "Sprint",
        definition:
          "A fixed time period (usually 1-2 weeks) during which a team commits to completing a defined set of work from the backlog. Each sprint begins with sprint planning and ends with a review and retrospective.",
        example:
          "Sprint 12 (2 weeks): Complete user login flow, club location selector, and basic contact info view. Team commits to 18 story points based on recent velocity.",
        tip: "The sprint goal — a single sentence describing what the team is trying to achieve — is more important than the list of tickets. It keeps the team aligned when scope needs to change mid-sprint.",
      },
      {
        name: "Acceptance Criteria",
        definition:
          "Specific, testable conditions that a user story must meet to be considered complete. Written before development begins, they define the boundaries of the work and prevent scope creep.",
        example:
          "For 'User can view free class schedule': Given I'm on the schedule screen, when I select today's date, then I see all free classes listed with time, class name, and instructor name. Classes must be sorted by start time.",
        tip: "Write acceptance criteria from the user's perspective, not the engineer's. If it describes internal implementation rather than user-observable behavior, rewrite it.",
      },
      {
        name: "Definition of Done",
        definition:
          "A shared team agreement on the minimum quality standards that must be met before any work can be considered truly complete. It applies to every story and prevents 'done but not really done' situations.",
        example:
          "Definition of Done: Code reviewed and approved, unit tests written and passing, QA tested on iOS and Android, accessibility checked, product manager has accepted the story, and it is deployed to staging.",
        tip: "The Definition of Done is a team agreement, not a PM checklist. Teams that define it together are more likely to hold each other accountable to it.",
      },
    ],
  },
  {
    key:   "strategy",
    label: "Strategy & Metrics",
    emoji: "📊",
    terms: [
      {
        name: "KPIs & Success Metrics",
        definition:
          "Key Performance Indicators are the measurable values that determine whether a product or feature is achieving its intended goals. Good metrics are specific, measurable, and tied directly to user or business outcomes.",
        example:
          "For a class registration feature: % of app users who register for at least one class per month (adoption), registration completion rate (usability), and reduction in front-desk registration calls (business value).",
        tip: "Avoid vanity metrics like total downloads or page views. Focus on metrics that change only when users are getting real value — retention, activation, and revenue are usually more meaningful.",
      },
      {
        name: "Prioritization Frameworks (RICE, ICE, MoSCoW)",
        definition:
          "Structured methods for ranking features or initiatives by their relative value and effort. RICE scores items by Reach × Impact × Confidence ÷ Effort. ICE uses Impact × Confidence × Ease. MoSCoW categorizes work as Must Have, Should Have, Could Have, and Won't Have.",
        example:
          "RICE example: A push notification feature reaches 10,000 users, has high impact (3), 80% confidence, and takes 2 weeks effort. RICE score = (10,000 × 3 × 0.8) / 2 = 12,000. Compare this score across all features to prioritize.",
        tip: "No framework is perfect — they're tools to structure conversation, not replace judgment. Always sanity-check scores against your product intuition and user research.",
      },
      {
        name: "Stakeholder Management",
        definition:
          "The ongoing process of identifying, communicating with, and aligning the people who have an interest in or influence over your product. Good stakeholder management builds trust, reduces surprises, and creates space for PMs to make good decisions.",
        example:
          "Weekly 15-min sync with the Head of Sales to share roadmap updates. Monthly exec readout with business impact metrics. Async Slack updates to engineering after each sprint review. Quarterly all-hands roadmap presentation.",
        tip: "Over-communicate proactively. Stakeholders who feel informed and heard are far less likely to escalate or undermine your roadmap decisions.",
      },
    ],
  },
  {
    key:   "scrum",
    label: "Scrum",
    emoji: "🔄",
    terms: [
      {
        name: "Scrum",
        definition:
          "Scrum is a lightweight framework designed to help teams tackle complex problems by delivering value in short, repeatable cycles called Sprints. It involves three key roles (Product Owner, Scrum Master, and the Scrum Team) working together to build, inspect, and adapt incrementally. The loop is simple: prioritize work, build it, review it, and repeat.",
        example:
          "A team building a mobile app uses Scrum to ship a new feature every two weeks, gathering user feedback after each Sprint to inform what gets built next.",
        tip: "As a Product Owner, your most important job in Scrum is maintaining a well-ordered, clearly prioritized Product Backlog. If the backlog is a mess, the whole framework breaks down.",
      },
      {
        name: "Scrum Theory",
        definition:
          "Scrum is built on two foundations: empiricism (learning through experience and observation) and lean thinking (eliminating waste and focusing on what matters most). It uses an iterative, incremental approach to manage risk and improve predictability, relying on three core pillars: transparency, inspection, and adaptation. Four formal events are built into every Sprint specifically to put these pillars into practice.",
        example:
          "A team notices mid-project that a feature isn't resonating with users. Because Scrum builds in regular inspection points, they can adapt quickly rather than spending months building the wrong thing.",
        tip: "The three pillars only work if you're honest about progress. As a PM, resist the urge to sugarcoat Sprint outcomes to stakeholders — real transparency is what allows the team to actually improve.",
      },
      {
        name: "Scrum Values",
        definition:
          "Scrum runs on five core values: Commitment, Focus, Openness, Respect, and Courage. These aren't just feel-good principles — they are the behavioral foundation that makes transparency, inspection, and adaptation actually possible. When a team genuinely lives these values, trust is built naturally and the entire framework becomes more effective.",
        example:
          "A developer has the courage to flag that a Sprint goal is unrealistic during planning, rather than staying quiet and missing the deadline. That one moment of honesty reflects multiple values working together: courage, openness, and respect for the team's time.",
        tip: "As a Product Owner, you set the tone. If you are not open about shifting priorities or don't have the courage to push back on unrealistic stakeholder demands, don't expect your team to embody these values either.",
      },
      {
        name: "Scrum Team",
        definition:
          "The Scrum Team is a small, cross-functional, self-managing unit made up of one Product Owner, one Scrum Master, and Developers, with no internal hierarchies or sub-teams. Everyone has the skills needed to deliver value each Sprint, and the team collectively decides who does what, when, and how. Ideally 10 people or fewer, the whole team is accountable for producing a valuable Increment every Sprint.",
        example:
          "Rather than handing designs to developers and waiting, a Scrum Team has designers, developers, and a QA engineer all working together within the same Sprint, eliminating handoff delays and bottlenecks.",
        tip: "As a Product Owner, resist the urge to micromanage how the team builds things. Your job is to clarify the 'what' and 'why' — the team owns the 'how.' Respecting that boundary is what keeps the team truly self-managing.",
      },
      {
        name: "Developers",
        definition:
          "Developers are the members of the Scrum Team responsible for actually building a usable Increment each Sprint. Their core accountabilities are consistent: planning the Sprint, maintaining quality through the Definition of Done, adapting daily toward the Sprint Goal, and holding each other accountable. Despite the title, 'Developers' isn't limited to software engineers — it refers to anyone doing the hands-on work of creating the product.",
        example:
          "A cross-functional group including a UX designer, two engineers, and a QA specialist all operate as Developers within the same Sprint, each contributing their skills toward a shared Increment.",
        tip: "As a Product Owner, build a strong working relationship with your Developers. The clearer and more available you are when they have questions about backlog items, the less time they waste on assumptions.",
      },
      {
        name: "Product Owner",
        definition:
          "The Product Owner is a single person accountable for maximizing the value of the product by managing the Product Backlog — defining the Product Goal, creating and communicating backlog items, and keeping the backlog ordered and transparent. They serve as the bridge between stakeholders and the Scrum Team, translating business needs into a clear, prioritized body of work.",
        example:
          "Multiple stakeholders are pushing for different features. Rather than letting the team get pulled in every direction, the Product Owner evaluates each request, makes a call on priority, and updates the backlog accordingly — one decision maker, one source of truth.",
        tip: "Guard your backlog fiercely. Stakeholders will always try to bypass the process and inject work directly to the team. As the Product Owner, you are the single point of authority — if you don't protect that boundary, prioritization becomes chaos.",
      },
      {
        name: "Scrum Master",
        definition:
          "The Scrum Master is a servant-leader accountable for ensuring Scrum is understood and practiced effectively by both the Scrum Team and the broader organization. They coach the team on self-management, remove impediments blocking progress, and make sure all Scrum events happen and are productive. Unlike a traditional manager, the Scrum Master leads by serving — clearing the path so the team can do their best work.",
        example:
          "The development team keeps getting pulled into ad-hoc meetings by other departments mid-Sprint. The Scrum Master steps in, works with leadership to protect the team's time, and establishes a clear process for how outside requests should be handled.",
        tip: "As a Product Owner, your Scrum Master is one of your most valuable allies. Lean on them to handle process and team dynamics so you can stay focused on the backlog and stakeholders. A strong PO and Scrum Master partnership is often the difference between a high-functioning team and a struggling one.",
      },
      {
        name: "Scrum Events",
        definition:
          "Scrum Events are a set of formal, structured opportunities built into every Sprint for the team to inspect and adapt. They create regularity and are designed to replace the need for unplanned, ad-hoc meetings. The Sprint itself acts as the container for all other events — skipping or shortchanging any of them means losing a critical checkpoint in the process.",
        example:
          "A team that skips the Sprint Retrospective for three Sprints in a row finds the same communication issues surfacing repeatedly, with no structured time to address them.",
        tip: "As a Product Owner, treat every Scrum event as non-negotiable. It can be tempting to skip a Sprint Review when things feel busy, but these events are where misalignment gets caught early. Missing them doesn't save time — it creates more problems down the road.",
      },
      {
        name: "The Sprint",
        definition:
          "A Sprint is a fixed-length event of one month or less that acts as the heartbeat of Scrum, turning ideas into a valuable Increment. All Scrum events happen within the Sprint, and during it the team protects the Sprint Goal by keeping quality high, refining the backlog as needed, and only renegotiating scope with the Product Owner when necessary. Shorter Sprints mean faster learning cycles and lower risk.",
        example:
          "A team running two-week Sprints discovers early that a feature is technically unfeasible. Because the Sprint is short, they lose two weeks at most — not two months — and can adapt quickly.",
        tip: "Only you as the Product Owner can cancel a Sprint, but use that power sparingly. If Sprint Goals are becoming obsolete frequently, that's a signal your backlog refinement and stakeholder alignment needs work upstream — before Sprint Planning.",
      },
      {
        name: "Sprint Planning",
        definition:
          "Sprint Planning kicks off every Sprint with the entire Scrum Team collaborating to answer three questions: why is this Sprint valuable (the Sprint Goal), what can be done this Sprint (selected backlog items), and how will the work get done (the Developers' plan). The Product Owner comes prepared with prioritized backlog items, but the Developers decide how much they can take on and how they will execute.",
        example:
          "The Product Owner proposes that this Sprint's goal is to improve checkout conversion. The team selects the top relevant backlog items, breaks them into tasks, and aligns on a Sprint Goal before the timebox ends.",
        tip: "Come to Sprint Planning with your top backlog items already refined and ordered — don't use Sprint Planning as a refinement session. The more prepared you are walking in, the stronger the Sprint Goal coming out.",
      },
      {
        name: "Daily Scrum",
        definition:
          "The Daily Scrum is a 15-minute event held at the same time and place every day, where Developers inspect progress toward the Sprint Goal and adjust their plan for the next day of work. It is owned by the Developers — not the Product Owner or Scrum Master — and the format is flexible as long as it stays focused on the Sprint Goal and produces an actionable plan.",
        example:
          "During the Daily Scrum, a developer flags that a third-party API integration is taking longer than expected. The team immediately re-plans the day's work to avoid blocking other Sprint items.",
        tip: "As a Product Owner, resist the urge to turn the Daily Scrum into a status report for yourself. It is the Developers' event. Showing up and redirecting the conversation undermines the team's self-management and focus.",
      },
      {
        name: "Sprint Review",
        definition:
          "The Sprint Review is a collaborative working session held at the end of the Sprint where the Scrum Team presents the Increment to key stakeholders, discusses progress toward the Product Goal, and determines what to do next. It is not just a demo — it is a two-way conversation where feedback from stakeholders can directly influence the Product Backlog and future direction.",
        example:
          "The team demos a new search feature and stakeholders immediately notice it doesn't match how real users actually search. That insight gets captured and the Product Owner adjusts the backlog before the next Sprint begins.",
        tip: "Treat the Sprint Review as a strategic alignment meeting, not a victory lap. Bring the right stakeholders, encourage honest feedback, and come ready to update the backlog on the spot. The quality of your next Sprint depends heavily on what you learn in this one.",
      },
      {
        name: "Sprint Retrospective",
        definition:
          "The Sprint Retrospective is the final event of the Sprint, where the Scrum Team reflects on how they worked together — covering people, processes, tools, and the Definition of Done — to identify what went well and what needs to improve. Unlike the Sprint Review which focuses on the product, the Retro focuses on the team itself.",
        example:
          "The team identifies that unclear acceptance criteria caused rework in the last Sprint. They agree that the Product Owner will include concrete examples with every backlog item going forward, and add that process change to the next Sprint Backlog.",
        tip: "Show up to the Retrospective with humility and openness. As a Product Owner, you are part of the team and just as accountable for process breakdowns. If Developers feel the Retro is only about their shortcomings, the event loses psychological safety and stops being useful.",
      },
      {
        name: "Scrum Artifacts",
        definition:
          "Scrum Artifacts represent the team's work and value, and are designed to maximize transparency so everyone is working from the same information. There are three artifacts: the Product Backlog, the Sprint Backlog, and the Increment — each paired with a commitment that keeps the team focused and progress measurable.",
        example:
          "A new team member joins mid-project. Because the Product Backlog, Sprint Backlog, and Increment are all transparent and up to date, they can quickly understand where the product is headed, what the team is working on now, and what has already been built.",
        tip: "Think of the three artifacts as your single source of truth at every level — the Product Backlog tells you where you're going long term, the Sprint Backlog tells you what you're doing right now, and the Increment shows you what you've actually built. If any of these are unclear or out of date, transparency breaks down.",
      },
      {
        name: "Product Backlog",
        definition:
          "The Product Backlog is a single, ordered, ever-evolving list of everything needed to improve the product, and the only source of work for the Scrum Team. Items are continuously refined over time — broken down into smaller, more precise pieces with clear descriptions and sizing — until they are ready to be pulled into a Sprint. Developers are responsible for sizing the work, while the Product Owner shapes priority.",
        example:
          "A vague backlog item like 'improve checkout experience' gets refined over several Sprints into smaller, clearly defined items like 'add Apple Pay as a payment option' with acceptance criteria and a size estimate — making it ready for Sprint Planning.",
        tip: "Refinement is one of your most important ongoing responsibilities as a Product Owner. Aim to always have at least two Sprints worth of refined, ready items at the top of your backlog so Sprint Planning runs smoothly.",
      },
      {
        name: "Product Goal",
        definition:
          "The Product Goal is the long-term objective that gives the Scrum Team a clear target to plan and work toward, living at the top of the Product Backlog. Everything else in the backlog exists to define what needs to be built to achieve it. A team works toward one Product Goal at a time and must either fulfill it or consciously abandon it before moving on to the next.",
        example:
          "A Product Goal might be 'enable small businesses to process payments fully online by Q3.' Every item in the backlog — from onboarding flows to payment integrations — ladders up to that goal.",
        tip: "If your team can't articulate the Product Goal from memory, it's not clear enough. A strong Product Goal acts as a decision-making filter — when stakeholders push for new features, you should be able to evaluate every request against it.",
      },
      {
        name: "Sprint Backlog",
        definition:
          "The Sprint Backlog is the Developers' own plan for the Sprint, made up of three things: the Sprint Goal (why), the selected Product Backlog items (what), and the delivery plan (how). It is a living, real-time document updated throughout the Sprint as the team learns more, and should be detailed enough that progress can be meaningfully inspected at every Daily Scrum. It belongs to the Developers alone.",
        example:
          "Midway through a Sprint, the team discovers a dependency they hadn't anticipated. They update the Sprint Backlog to reflect the new plan, swapping one item for another that still serves the Sprint Goal.",
        tip: "As a Product Owner, you can see the Sprint Backlog but you don't own it. If you notice the team's plan drifting away from the Sprint Goal mid-Sprint, raise it as a conversation rather than a directive.",
      },
      {
        name: "Sprint Goal",
        definition:
          "The Sprint Goal is the single, focused objective the Developers commit to achieving each Sprint, created collaboratively during Sprint Planning and added to the Sprint Backlog. It provides flexibility in how the work gets done while keeping the entire team pointed in the same direction — preventing the Sprint from becoming a disconnected list of unrelated tasks.",
        example:
          "The Sprint Goal is 'allow users to track their order in real time.' If a specific tracking feature turns out to be technically complex, the team can swap in a simpler solution that still achieves the goal — without derailing the Sprint.",
        tip: "Write Sprint Goals as outcomes, not task lists. 'Improve the onboarding flow so new users reach their first key action faster' is a strong Sprint Goal. 'Build onboarding screens 1 through 4' is just a to-do list.",
      },
      {
        name: "Increment",
        definition:
          "An Increment is a concrete, usable, and verified piece of value that moves the product closer to the Product Goal — and every new Increment builds on top of all previous ones. Multiple Increments can be created within a single Sprint and can be released before the Sprint Review. Work does not count as part of an Increment unless it meets the Definition of Done.",
        example:
          "A team completes three usable features in one Sprint. Two are released to users mid-Sprint because they are ready and valuable. All three are then presented at the Sprint Review as part of the cumulative Increment.",
        tip: "Don't treat the Sprint Review as a release gate. If something is done and valuable, ship it. Holding back finished work until the end of a Sprint slows down value delivery and contradicts the core purpose of Scrum.",
      },
      {
        name: "Definition of Done",
        definition:
          "The Definition of Done is a formal, shared agreement on exactly what 'complete' means for an Increment — covering all quality standards that must be met before work can be released or presented at a Sprint Review. The moment a backlog item meets the Definition of Done, an Increment is born; if it doesn't meet it, the work goes back to the backlog.",
        example:
          "A team's Definition of Done includes: code reviewed, unit tests passing, accessibility checked, and deployed to staging. A feature that skips any of these steps is not Done regardless of how complete it feels.",
        tip: "Push for a Definition of Done that is ambitious but realistic. A weak Definition of Done leads to technical debt and quality issues that will slow the team down later. As a Product Owner, you have a stake in this — low quality Increments erode user trust.",
      },
    ],
  },
];