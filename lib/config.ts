import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
    appName: 'x402 Gateway',
    projectId: 'YOUR_PROJECT_ID', // TODO: Get a project ID from WalletConnect
    chains: [baseSepolia],
    ssr: true,
});
