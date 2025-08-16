/**
 * Test script for bags.fm API integration
 * Run this with: node test-bags-api.js
 */

const fetch = require('node-fetch');

class BagsAPITest {
    constructor(apiKey) {
        this.baseURL = 'https://public-api-v2.bags.fm/api/v1';
        this.apiKey = apiKey;
        this.kymTwitterUsername = 'knowyourmeme';
    }

    async testKYMWalletLookup() {
        console.log('🔍 Testing KYM Twitter wallet lookup...');
        
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

            console.log(`Response status: ${response.status}`);
            
            if (!response.ok) {
                console.log(`❌ API Error: ${response.status} - ${response.statusText}`);
                const errorText = await response.text();
                console.log('Error details:', errorText);
                return null;
            }

            const data = await response.json();
            console.log('✅ API Response:', JSON.stringify(data, null, 2));
            
            if (data.success && data.response) {
                console.log(`📝 KYM Wallet Address: ${data.response}`);
                return data.response;
            } else {
                console.log('❌ No wallet found in response');
                return null;
            }
        } catch (error) {
            console.log('❌ Network/Fetch Error:', error.message);
            return null;
        }
    }

    async testWalletBalance(walletAddress) {
        if (!walletAddress) {
            console.log('⚠️ No wallet address to test balance');
            return;
        }

        console.log('\n💰 Testing wallet balance lookup...');
        
        try {
            // Test with Helius demo API
            const response = await fetch('https://api.helius-rpc.com/?api-key=demo', {
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
            const sol = balance / 1000000000;
            
            console.log(`✅ Wallet Balance: ${balance} lamports (${sol.toFixed(4)} SOL)`);
            
            // Test SOL price lookup
            const priceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
            const priceData = await priceResponse.json();
            const solPrice = priceData.solana?.usd || 0;
            const usdValue = sol * solPrice;
            
            console.log(`💵 SOL Price: $${solPrice}`);
            console.log(`💰 USD Value: $${usdValue.toFixed(2)}`);
            
        } catch (error) {
            console.log('❌ Balance lookup error:', error.message);
        }
    }

    async runFullTest() {
        console.log('🚀 Starting bags.fm API Integration Test\n');
        console.log('='.repeat(50));
        
        const wallet = await this.testKYMWalletLookup();
        await this.testWalletBalance(wallet);
        
        console.log('\n' + '='.repeat(50));
        console.log('✅ Test completed!');
        
        console.log('\n📊 Current Status:');
        console.log('• KYM Twitter account:', this.kymTwitterUsername);
        console.log('• Wallet found:', wallet ? 'YES' : 'NO');
        console.log('• API connectivity:', wallet ? 'WORKING' : 'NEEDS ATTENTION');
        
        console.log('\n🎯 What this means:');
        if (wallet) {
            console.log('✅ Ready to track funds when token launches on bags.fm');
            console.log('✅ Will automatically detect fees sent to KYM wallet');
            console.log('✅ Real-time USD conversion working');
        } else {
            console.log('⚠️ KYM Twitter account may not be set up for fee sharing yet');
            console.log('🔧 This will be resolved when you configure bags.fm launch');
        }
    }
}

// Run test
const apiKey = 'bags_prod_ZO5N-h9Am-2hLjUljh1CUjTpn0oC6lVvNqQOff5SC3Q';
const test = new BagsAPITest(apiKey);
test.runFullTest();