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
];
