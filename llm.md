# Task

Now we have dynamic integrated, we're only gonna use it for its embedded wallets for our users.
The actual authentication will utilize lens accounts. Once we have a dynamic user account and its address,
we can check if it has an existing lens account, if yes, we go to the dashboard, if not we'll show the onboarding screen.

Also now we have a working authentication. Let's create a wrapper component what handles the authentication logic / checks
for pages that requires authentication. You can check the docs https://reactrouter.com/start/framework/routing.

As for the lens docs, you can read docs/lens.txt

frontend-developer to implement code
