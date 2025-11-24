import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import { contractAddress, contractABI } from "../utils/contractConfig";

// ------------------------------------------------------
// CONTEXTO GLOBAL
// ------------------------------------------------------
const Web3Context = createContext();
export const useWeb3 = () => useContext(Web3Context);

// ------------------------------------------------------
// PROVIDER GLOBAL
// ------------------------------------------------------
export function Web3Provider({ children }) {
    const [account, setAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);

    // ------------------------------------------------------
    // Inicializar Web3 (Provider, Signer, Contract)
    // ------------------------------------------------------
    async function initWeb3(walletAddress) {
        try {
            if (!window.ethereum) return;

            const _provider = new ethers.BrowserProvider(window.ethereum);
            const _signer = await _provider.getSigner();
            const _contract = new ethers.Contract(contractAddress, contractABI, _signer);

            setProvider(_provider);
            setSigner(_signer);
            setContract(_contract);
            setAccount(walletAddress);

            console.log("Web3 inicializado con:", walletAddress);
        } catch (err) {
            console.error("Error al inicializar Web3:", err);
        }
    }

    // ------------------------------------------------------
    // Conectar a MetaMask
    // ------------------------------------------------------
    async function connectWallet() {
        try {
            if (!window.ethereum) throw new Error("MetaMask no está instalado");

            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });

            const wallet = accounts[0];
            localStorage.setItem("wallet", wallet);
            await initWeb3(wallet);

            return wallet;
        } catch (err) {
            console.error("Error al conectar MetaMask:", err);
            throw err;
        }
    }

    // ------------------------------------------------------
    // Desconectar (Logout)
    // ------------------------------------------------------
    function disconnectWallet() {
        setAccount(null);
        setProvider(null);
        setSigner(null);
        setContract(null);
        localStorage.removeItem("wallet");
    }

    // ------------------------------------------------------
    // Efecto: Cargar sesión y escuchar eventos
    // ------------------------------------------------------
    useEffect(() => {
        const savedWallet = localStorage.getItem("wallet");

        if (savedWallet) {
            initWeb3(savedWallet).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }

        if (window.ethereum) {
            // Detectar cambio de cuenta
            window.ethereum.on("accountsChanged", (accounts) => {
                if (accounts.length > 0) {
                    localStorage.setItem("wallet", accounts[0]);
                    initWeb3(accounts[0]);
                } else {
                    disconnectWallet();
                }
            });

            // Detectar cambio de red
            window.ethereum.on("chainChanged", () => {
                window.location.reload();
            });
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeAllListeners("accountsChanged");
                window.ethereum.removeAllListeners("chainChanged");
            }
        };
    }, []);

    return (
        <Web3Context.Provider
            value={{
                account,
                provider,
                signer,
                contract,
                connectWallet,
                disconnectWallet,
                loading,
                login: connectWallet,
                logout: disconnectWallet
            }}
        >
            {children}
        </Web3Context.Provider>
    );
}
