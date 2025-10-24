import { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect, useWalletClient } from 'wagmi'
import { PublicClient, testnet, evmAddress } from '@lens-protocol/client'
import { setAppSponsorship } from '@lens-protocol/client/actions'
import { signMessageWith } from '@lens-protocol/client/viem'
import { formatEther } from 'viem'

export default function App() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: walletClient } = useWalletClient()

  const [appAddress, setAppAddress] = useState('')
  const [sponsorshipAddress, setSponsorshipAddress] = useState('')
  const [status, setStatus] = useState('')
  const [sessionClient, setSessionClient] = useState<any>(null)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [isSetting, setIsSetting] = useState(false)
  const [fundAmount, setFundAmount] = useState('')
  const [isFunding, setIsFunding] = useState(false)
  const [sponsorshipBalance, setSponsorshipBalance] = useState<string | null>(null)
  const [isLoadingBalance, setIsLoadingBalance] = useState(false)

  const handleAuthenticate = async () => {
    console.log('handleAuthenticate called', { walletClient, address, appAddress, sponsorshipAddress })

    if (!walletClient || !address) {
      console.error('No wallet client or address', { walletClient, address })
      setStatus('Please connect your wallet first. WalletClient: ' + (walletClient ? 'exists' : 'missing'))
      return
    }

    if (!appAddress || !sponsorshipAddress) {
      setStatus('Please enter both addresses')
      return
    }

    setIsAuthenticating(true)
    setStatus('Authenticating as Builder...')

    try {
      console.log('Creating Lens client...')
      const client = PublicClient.create({ environment: testnet })

      console.log('Calling client.login...')
      const result = await client.login({
        builder: {
          address: evmAddress(address),
        },
        signMessage: signMessageWith(walletClient),
      })

      console.log('Login result:', result)

      if (result.isErr()) {
        console.error('Login error:', result.error)
        setStatus(`Authentication failed: ${result.error.message}`)
        setIsAuthenticating(false)
        return
      }

      setSessionClient(result.value)
      setStatus('✅ Authenticated as Builder!')
      setIsAuthenticating(false)
    } catch (error: any) {
      console.error('Exception during auth:', error)
      setStatus(`Error: ${error.message}`)
      setIsAuthenticating(false)
    }
  }

  const handleSetSponsorship = async () => {
    if (!sessionClient || !walletClient) {
      setStatus('Please authenticate first')
      return
    }

    setIsSetting(true)
    setStatus('Setting app sponsorship...')

    try {
      console.log('Calling setAppSponsorship...')

      const sponsorshipResult = await setAppSponsorship(sessionClient, {
        app: evmAddress(appAddress),
        sponsorship: evmAddress(sponsorshipAddress),
      })

      console.log('Sponsorship result:', sponsorshipResult)

      if (sponsorshipResult.isErr()) {
        console.error('Sponsorship error:', sponsorshipResult.error)
        setStatus(`Failed: ${sponsorshipResult.error.message}`)
        setIsSetting(false)
        return
      }

      const txRequest = sponsorshipResult.value
      console.log('Transaction request:', txRequest)

      setStatus('Please confirm the transaction in MetaMask...')

      // Send zkSync EIP-712 transaction
      const txHash = await walletClient.sendTransaction({
        account: walletClient.account,
        to: txRequest.raw.to as `0x${string}`,
        data: txRequest.raw.data as `0x${string}`,
        value: BigInt(txRequest.raw.value),
        gas: BigInt(txRequest.raw.gasLimit),
        maxFeePerGas: BigInt(txRequest.raw.maxFeePerGas),
        maxPriorityFeePerGas: BigInt(txRequest.raw.maxPriorityFeePerGas),
        nonce: txRequest.raw.nonce,
        type: 'eip712' as any,
        paymaster: txRequest.raw.customData.paymasterParams.paymaster as `0x${string}`,
        paymasterInput: txRequest.raw.customData.paymasterParams.paymasterInput as `0x${string}`,
        gasPerPubdata: BigInt(txRequest.raw.customData.gasPerPubdata),
        factoryDeps: txRequest.raw.customData.factoryDeps as `0x${string}`[],
      })

      console.log('Transaction hash:', txHash)
      setStatus(`Transaction sent: ${txHash}. Waiting for confirmation...`)

      // Wait for transaction to be mined
      const txWaitResult = await sessionClient.waitForTransaction(txHash)
      console.log('Transaction wait result:', txWaitResult)

      if (txWaitResult.isOk()) {
        console.log('Transaction confirmed!')
        setStatus(`🎉 Success! Transaction confirmed: ${txHash}. Sponsorship has been set. You can now delete this folder.`)
      } else {
        console.error('Transaction wait failed:', txWaitResult.error)
        setStatus(`Transaction failed during confirmation: ${txWaitResult.error.message}`)
      }

      setIsSetting(false)
    } catch (error: any) {
      console.error('Exception during sponsorship:', error)
      setStatus(`Error: ${error.message}`)
      setIsSetting(false)
    }
  }

  // Fetch sponsorship balance
  const fetchSponsorshipBalance = async () => {
    if (!walletClient || !sponsorshipAddress) return

    setIsLoadingBalance(true)
    try {
      console.log('Fetching balance for:', sponsorshipAddress)
      const { getBalance } = await import('viem/actions')
      const balance = await getBalance(walletClient, {
        address: sponsorshipAddress as `0x${string}`,
      })
      const formattedBalance = formatEther(balance)
      console.log('Balance:', formattedBalance, 'GRASS')
      setSponsorshipBalance(formattedBalance)
    } catch (error: any) {
      console.error('Error fetching balance:', error)
      setSponsorshipBalance(null)
    } finally {
      setIsLoadingBalance(false)
    }
  }

  // Fetch balance when sponsorship address changes
  useEffect(() => {
    if (sponsorshipAddress && walletClient) {
      fetchSponsorshipBalance()
    } else {
      setSponsorshipBalance(null)
    }
  }, [sponsorshipAddress, walletClient])

  const handleFundSponsorship = async () => {
    if (!walletClient || !address) {
      setStatus('Please connect your wallet first')
      return
    }

    if (!sponsorshipAddress) {
      setStatus('Please enter sponsorship address first')
      return
    }

    if (!fundAmount || parseFloat(fundAmount) <= 0) {
      setStatus('Please enter a valid amount (e.g., 0.1, 1, 10)')
      return
    }

    setIsFunding(true)
    setStatus(`Funding sponsorship with ${fundAmount} GRASS...`)

    try {
      console.log(`Funding sponsorship ${sponsorshipAddress} with ${fundAmount} GRASS`)

      // Parse amount to wei (18 decimals)
      const valueInWei = BigInt(Math.floor(parseFloat(fundAmount) * 1e18))
      console.log(`Amount in wei: ${valueInWei}`)

      setStatus('Please confirm the transaction in MetaMask...')

      const txHash = await walletClient.sendTransaction({
        account: walletClient.account,
        to: sponsorshipAddress as `0x${string}`,
        value: valueInWei,
      })

      console.log('Funding transaction hash:', txHash)
      setStatus(`Transaction sent: ${txHash}. Waiting for confirmation...`)

      // Wait for transaction using viem
      const { waitForTransactionReceipt } = await import('viem/actions')
      const receipt = await waitForTransactionReceipt(walletClient, {
        hash: txHash,
      })

      console.log('Transaction receipt:', receipt)

      if (receipt.status === 'success') {
        setStatus(`🎉 Success! Sponsorship funded with ${fundAmount} GRASS. Transaction: ${txHash}`)
        setFundAmount('') // Clear input
        // Refresh balance
        await fetchSponsorshipBalance()
      } else {
        setStatus(`Transaction failed. Please check the explorer.`)
      }

      setIsFunding(false)
    } catch (error: any) {
      console.error('Exception during funding:', error)
      setStatus(`Error: ${error.message}`)
      setIsFunding(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Lens Sponsorship Manager
            </h1>
            {isConnected && (
              <button
                onClick={() => disconnect()}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Disconnect
              </button>
            )}
          </div>
          <p className="text-gray-600">
            Internal tool for managing Lens app sponsorships
          </p>
        </div>

        {/* Status */}
        {status && (
          <div className={`mb-6 p-4 rounded-lg ${
            status.includes('✅') || status.includes('🎉')
              ? 'bg-green-50 text-green-800'
              : status.includes('Error') || status.includes('Failed')
              ? 'bg-red-50 text-red-800'
              : 'bg-blue-50 text-blue-800'
          }`}>
            {status}
          </div>
        )}

        {!isConnected ? (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-4">Connect Wallet</h2>
            <p className="text-gray-600 mb-6">
              Connect your Builder wallet to get started
            </p>
            <button
              onClick={() => connect({ connector: connectors[0] })}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Connected Wallet Info */}
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">
                Connected: <span className="font-mono text-green-600">{address}</span>
              </p>
            </div>

            {/* Section 1: Set App Sponsorship */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                1. Set App Sponsorship
              </h2>
              <p className="text-gray-600 mb-6">
                Link your Lens app with its sponsorship contract (one-time setup)
              </p>

              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      App Address
                    </label>
                    <input
                      type="text"
                      value={appAddress}
                      onChange={(e) => setAppAddress(e.target.value)}
                      placeholder="0x..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Your Lens app contract address (from dashboard)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sponsorship Address
                    </label>
                    <input
                      type="text"
                      value={sponsorshipAddress}
                      onChange={(e) => setSponsorshipAddress(e.target.value)}
                      placeholder="0x..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Your sponsorship contract address (from dashboard)
                    </p>
                  </div>
                </div>

                {appAddress && sponsorshipAddress && !sessionClient && (
                  <div className="pt-4 border-t">
                    <button
                      onClick={handleAuthenticate}
                      disabled={isAuthenticating}
                      className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-semibold py-2 px-6 rounded-lg transition"
                    >
                      {isAuthenticating ? 'Authenticating...' : 'Authenticate as Builder'}
                    </button>
                  </div>
                )}

                {sessionClient && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-green-600 mb-3">✓ Authenticated as Builder</p>
                    <button
                      onClick={handleSetSponsorship}
                      disabled={isSetting}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-2 px-6 rounded-lg transition"
                    >
                      {isSetting ? 'Setting Sponsorship...' : 'Set App Sponsorship'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Fund Sponsorship */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                2. Fund Sponsorship
              </h2>
              <p className="text-gray-600 mb-6">
                Add GRASS tokens to enable gas-free transactions for users
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sponsorship Address
                  </label>
                  <input
                    type="text"
                    value={sponsorshipAddress}
                    onChange={(e) => setSponsorshipAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Enter the sponsorship contract address
                  </p>
                </div>

                {sponsorshipBalance !== null && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">Current Balance</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {parseFloat(sponsorshipBalance).toFixed(4)} GRASS
                    </p>
                  </div>
                )}

                {isLoadingBalance && (
                  <p className="text-sm text-gray-500">Loading balance...</p>
                )}

                {sponsorshipAddress && (
                  <div className="pt-4 border-t">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Amount (GRASS)
                        </label>
                        <input
                          type="number"
                          value={fundAmount}
                          onChange={(e) => setFundAmount(e.target.value)}
                          placeholder="e.g., 0.1, 1, 10, 100"
                          step="0.1"
                          min="0"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Enter amount in GRASS tokens (e.g., 0.1 = 0.1 GRASS, 1 = 1 GRASS)
                        </p>
                        <p className="mt-1 text-xs text-amber-600">
                          💡 Tip: Start with 1-10 GRASS for testing
                        </p>
                      </div>

                      <button
                        onClick={handleFundSponsorship}
                        disabled={isFunding || !fundAmount}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2 px-6 rounded-lg transition"
                      >
                        {isFunding ? 'Sending...' : 'Fund Sponsorship'}
                      </button>
                    </div>

                    <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                      <p className="font-medium mb-1">Cost Estimates</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>~0.001-0.01 GRASS per transaction</li>
                        <li>1 GRASS ≈ 100-1000 sponsored transactions</li>
                        <li>Monitor balance in Lens dashboard</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
