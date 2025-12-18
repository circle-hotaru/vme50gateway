# x402 Gateway - Quick Start Guide

This project is a Next.js application designed to demonstrate the x402 concept (Payment Required Gateway).

## Prerequisites
- **Node.js**: Version 18 or higher (Recommended: v20).
- **Wallet**: Metamask or Coinbase Wallet (Browser Extension) with **Base Sepolia** testnet configured.

## How to Run (For Judges/Teammates)

1.  **Enter Directory**
    ```bash
    cd web
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment (Optional)**
    - The project runs out-of-the-box with default settings.
    - If you see WalletConnect errors, open `lib/config.ts` and add your own `projectId` from [cloud.walletconnect.com](https://cloud.walletconnect.com) (it's free).

4.  **Start Development Server**
    ```bash
    npm run dev
    ```

5.  **Access the App**
    - Open `http://localhost:3000` in your browser.

## Demo Flow
1.  **Dashboard**: `/dashboard` -> Connect Wallet -> Create Link.
2.  **Public Page**: Open the generated `/c/[id]` link.
3.  **Pay**: Click "Pay" to send Testnet ETH/USDC.
4.  **Refund**: Go back to Dashboard -> Inbox -> Click "Refund" to return funds.
