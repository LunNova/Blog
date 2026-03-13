+++
title = "Bypassing triplebyte Direct Booking requirements"
date = 2022-07-22
updated = 2024-09-05
description = "Triplebyte vulnerability allowed anyone to see the direct link to bypass screening"

[taxonomies]
tags = ["security", "bug bounties"]
+++

Triplebyte was [acquired by Karat in 2023](https://karat.com/karat-acquires-leading-adaptive-assessment-technology-from-triplebyte/) ([archived](https://archive.is/bSMvM)) and [shut down shortly after](https://connect.karat.com/tb-candidates) ([archived](https://archive.is/MnVT3)). This article is preserved for historical purposes.

Triplebyte was a tech hiring platform that offered skill assessments and connected tested candidates with potential employers, bypassing resume screenings.

---

While working on an afternoon project to add my own filtering to triplebyte's job search, I discovered a security issue.  
Triplebyte had a "direct booking"[^1] feature which allowed anyone who scored well on triplebyte's assessments to visit a booking site (usually calendly) and set up a call with a recruiter. It was optional, and the company set the required assessment scores.  
Triplebyte's initial implementation of this stored it in a 'book_now_link' field inside serialized JSON and included it in the page source.

```json
"vip":{
  "exists":true,
  "skill_requirements":[
    {
      "key":"programmatic_problem_solving",
      "score":4,
      "title":"General Coding Logic"
    }
  ],

  // This shouldn't be here:
  "book_now_link":"https://calendly.com/Redacted/30min",
  "assign_to_company_user_name":"Redacted Redacted",

  "min_years_xp":4,
  "work_authorization_required":true,
  "salary_range":null,
  "calls_left":true,
  "status":{
    "status":"failed",
    "missing_requirements":[],
    "missing_skills":[]
  }
}
```

It's a very simple bug. Don't include sensitive information in your page and rely on the client to hide it.

### Timeline

1. 2021-09-16 - Issue reported by email
2. 2021-10-05 - Issue reported using zendesk support ticket due to no response
3. 2021-10-20 - Triplebyte respond saying it's fixed and offer $200

### Bounty Process

This was a relatively pleasant bounty experience.
The issue got fixed, I got paid. It took a month and a half and reaching out multiple times but that's better than many places with a proper bounty process manage.

[^1]: The feature seems to have been removed entirely now.