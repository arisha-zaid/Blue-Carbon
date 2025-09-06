# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e5]:
    - generic [ref=e7]: C
    - heading "Welcome Back" [level=2] [ref=e8]
    - paragraph [ref=e9]: Sign in to your Carbon SIH account
  - generic [ref=e10]:
    - generic [ref=e11]:
      - generic [ref=e12]:
        - generic [ref=e13]: Email Address
        - generic [ref=e14]:
          - generic:
            - img
          - textbox "Email Address" [ref=e15]: invalid-email
      - generic [ref=e16]:
        - generic [ref=e17]: Password
        - generic [ref=e18]:
          - generic:
            - img
          - textbox "Password" [active] [ref=e19]: password123
          - button [ref=e20]:
            - img [ref=e21]
    - button "Forgot your password?" [ref=e25]
    - button "Sign In" [ref=e26]
    - generic [ref=e31]: Or continue with
    - button "Sign in with Google" [ref=e32]:
      - img [ref=e33]
      - text: Sign in with Google
  - paragraph [ref=e39]:
    - text: Don't have an account?
    - link "Sign up here" [ref=e40] [cursor=pointer]:
      - /url: /register
```