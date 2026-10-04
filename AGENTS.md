<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Theme state uses `html.light` for day mode and its absence for night mode; restore the saved choice at the root so all routes and dark variants share one source of truth.
- Transaction detail colors use dedicated semantic tokens with light-mode aliases so its reference styling does not change other screens.
