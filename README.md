This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# Harbor PH Development Documentation

## Project Setup

- **Created with:**
  ```bash
  npx create-next-app@latest . --ts --tailwind --eslint --src-dir --app --import-alias "@/*" --use-npm --no-interactive
  ```
- **Installed dependencies:**
  - Prisma: `npm install prisma @prisma/client`
  - Tailwind CSS (via Next.js setup)
- **Font:**
  - Using Roboto Flex (variable font) via `next/font/google`.

## Development Log

See [`docs/dev-log.md`](docs/dev-log.md) for the full development log.

## Running the Project

```bash
npm install
npm run dev
```

- Local: http://localhost:3000

## Troubleshooting

- **500 Internal Server Error:**  
  Make sure the font variable is defined in `layout.tsx` and used consistently in your CSS and components.
- **'next' is not recognized:**  
  Use `npm run dev` instead of `next dev` directly.

## Notes

- To change the default font, update the import and variable in `src/app/layout.tsx` and `src/app/globals.css`.
- Use `font-[family-name:var(--font-roboto-flex)]` in Tailwind classes for Roboto Flex.
- For new features or fixes, add an entry to the Development Log above.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
