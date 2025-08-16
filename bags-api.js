/**
 * bags.fm API Integration for KYM-Tan
 * Tracks funds raised through fee sharing to KYM Twitter account
 */

class BagsAPI {
    constructor(apiKey) {
        this.baseURL = 'https://public-api-v2.bags.fm/api/v1';
        this.apiKey = apiKey;
        this.kymTwitterUsername = 'knowyourmeme'; // KYM's Twitter handle
        this.kymWallet = null;
        this.cache = {
            wallet: null,
            fees: null,
            lastUpdate: 0,
            ttl: 300000 // 5 minutes cache
        };
    }

    /**
     * Get the Solana wallet address associated with KYM Twitter account
     */
    async getKYMWallet() {
        if (this.cache.wallet && Date.now() - this.cache.lastUpdate < this.cache.ttl) {
            return this.cache.wallet;
        }

        try {
            const response = await fetch(
                `${this.baseURL}/token-launch/fee-share/wallet/twitter?twitterUsername=${this.kymTwitterUsername}`,
                {
                    method: 'GET',
                    headers: {
                        'x-api-key': this.apiKey,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.success && data.response) {
                this.kymWallet = data.response;
                this.cache.wallet = data.response;
                this.cache.lastUpdate = Date.now();
                return data.response;
            }
            
            throw new Error('Failed to get wallet address from API response');
        } catch (error) {
            console.error('Error fetching KYM wallet:', error);
            throw error;
        }
    }

    /**
     * Get lifetime fees for a specific token that went to KYM
     */
    async getTokenLifetimeFees(tokenMint) {
        try {
            const response = await fetch(
                `${this.baseURL}/token-launch/lifetime-fees?tokenMint=${tokenMint}`,
                {
                    method: 'GET',
                    headers: {
                        'x-api-key': this.apiKey,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.success && data.response) {
                // Convert from lamports to SOL
                const lamports = parseInt(data.response);
                const sol = lamports / 1000000000; // 1 SOL = 1,000,000,000 lamports
                return {
                    lamports,
                    sol,
                    tokenMint
                };
            }
            
            throw new Error('Failed to get lifetime fees from API response');
        } catch (error) {
            console.error(`Error fetching token fees for ${tokenMint}:`, error);
            throw error;
        }
    }

    /**
     * Get total SOL balance of KYM wallet (direct Solana blockchain query)
     */
    async getKYMWalletBalance() {
        try {
            const walletAddress = await this.getKYMWallet();
            
            // Use Solana Web3.js for direct blockchain query
            if (typeof window !== 'undefined' && window.solanaWeb3) {
                const connection = new window.solanaWeb3.Connection('https://api.mainnet-beta.solana.com');
                const publicKey = new window.solanaWeb3.PublicKey(walletAddress);
                const balance = await connection.getBalance(publicKey);
                
                return {
                    lamports: balance,
                    sol: balance / 1000000000,
                    wallet: walletAddress
                };
            } else {
                // Fallback: Use Helius API
                const response = await fetch(`https://api.helius-rpc.com/?api-key=demo`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        id: 1,
                        method: 'getBalance',
                        params: [walletAddress]
                    })
                });
                
                const data = await response.json();
                const balance = data.result?.value || 0;
                
                return {
                    lamports: balance,
                    sol: balance / 1000000000,
                    wallet: walletAddress
                };
            }
        } catch (error) {
            console.error('Error fetching KYM wallet balance:', error);
            throw error;
        }
    }

    /**
     * Get SOL price in USD for conversion
     */
    async getSolPrice() {
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
            const data = await response.json();
            return data.solana?.usd || 0;
        } catch (error) {
            console.error('Error fetching SOL price:', error);
            return 0;
        }
    }

    /**
     * Get comprehensive funds raised data
     */
    async getFundsRaisedData() {
        try {
            const [walletBalance, solPrice] = await Promise.all([
                this.getKYMWalletBalance(),
                this.getSolPrice()
            ]);

            const usdValue = walletBalance.sol * solPrice;

            return {
                wallet: walletBalance.wallet,
                sol: walletBalance.sol,
                usd: usdValue,
                formatted: this.formatCurrency(usdValue),
                lastUpdated: new Date().toISOString(),
                source: 'bags.fm'
            };
        } catch (error) {
            console.error('Error getting comprehensive funds data:', error);
            
            // Return fallback data
            return {
                wallet: null,
                sol: 0,
                usd: 0,
                formatted: '$0',
                lastUpdated: new Date().toISOString(),
                source: 'fallback',
                error: error.message
            };
        }
    }

    /**
     * Format currency for display
     */
    formatCurrency(amount) {
        if (amount >= 1000000) {
            return `$${(amount / 1000000).toFixed(1)}M`;
        } else if (amount >= 1000) {
            return `$${(amount / 1000).toFixed(0)}K`;
        }
        return `$${Math.floor(amount).toLocaleString()}`;
    }

    /**
     * Start real-time tracking with periodic updates
     */
    startTracking(callback, interval = 60000) { // Default 1 minute
        const trackingLoop = async () => {
            try {
                const fundsData = await this.getFundsRaisedData();
                callback(fundsData);
            } catch (error) {
                console.error('Tracking error:', error);
                callback({
                    wallet: null,
                    sol: 0,
                    usd: 0,
                    formatted: '$0',
                    lastUpdated: new Date().toISOString(),
                    source: 'error',
                    error: error.message
                });
            }
        };

        // Initial call
        trackingLoop();

        // Set up periodic updates
        return setInterval(trackingLoop, interval);
    }

    /**
     * Get claimable fees for KYM wallet
     */
    async getClaimableTransactions() {
        try {
            const walletAddress = await this.getKYMWallet();
            
            const response = await fetch(`${this.baseURL}/token-launch/claim-txs`, {
                method: 'POST',
                headers: {
                    'x-api-key': this.apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    feeClaimer: walletAddress
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching claimable transactions:', error);
            throw error;
        }
    }

    /**
     * Health check for API connectivity
     */
    async healthCheck() {
        try {
            const wallet = await this.getKYMWallet();
            return {
                healthy: true,
                wallet: wallet,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                healthy: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BagsAPI;
} else if (typeof window !== 'undefined') {
    window.BagsAPI = BagsAPI;
}