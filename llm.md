# Task

frontend-developer, lets review how our auth flow currently works. The auth-context.ts is a bit messy and confusing.

We wanna simplify the code and fix the auth process all together.

Here's what we expect from the auth flow.

- We use dynamic.xyz for creating user wallets.
- We use lens account to track sessions, lens accounts require a wallet which is provided by dynamic

The flow is:

- Once a user successfully authenticates with dynamic. We retrieve the lens profile (accounts available) of the user wallet address from dynamic
- If a user has no lens profile, we redirect the user to onboarding
- If the user has one or more lens profile, we redirect the user to the account selector page and have them select which lens account the want to login to.

Let's review our current component architecture related to auth and see if need to refactor or have a separate higher order component for the auth flow (login, onboarding, account selector).

Since we are managing 2 sessions which can expire (dynamic, lens), we want to call the logout on the other if the other expires.

i.e 
- Dynamic session expires -> call logout on lens sdk
- Lens resume session failed -> call logout on dynamic sdk

Let's also check how we can keep the session alive for both in our app

Let's also check how we can keep the session alive for both in our app. 

Create a task list that we're gonna start to implement next

