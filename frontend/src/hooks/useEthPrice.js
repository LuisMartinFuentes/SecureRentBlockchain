import { useState, useEffect } from "react";

export function useEthPrice() {
    const [ethPrice, setEthPrice] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPrice = async () => {
            try {
                const response = await fetch(
                    "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=mxn"
                );
                const data = await response.json();
                if (data.ethereum && data.ethereum.mxn) {
                    setEthPrice(data.ethereum.mxn);
                } else {
                    // Fallback hardcoded if API fails structure
                    console.warn("API CoinGecko structure changed or limit reached");
                }
                setLoading(false);
            } catch (err) {
                console.error("Error fetching ETH price:", err);
                setError(err);
                setLoading(false);
            }
        };

        fetchPrice();

        // Update every 60 seconds
        const interval = setInterval(fetchPrice, 60000);
        return () => clearInterval(interval);
    }, []);

    return { ethPrice, loading, error };
}
