import { Address } from "viem";
import {
  Currency,
  ExtendedNative,
  WNATIVE,
} from "@cryptoalgebra/custom-pools-sdk";
import { ADDRESS_ZERO } from "@cryptoalgebra/custom-pools-sdk";
import {
  DEFAULT_CHAIN_ID,
  DEFAULT_NATIVE_NAME,
  DEFAULT_NATIVE_SYMBOL,
} from "@/data/algebra/default-chain-id";
import { useAlgebraToken } from "./useAlgebraToken";
import { WNATIVE_EXTENDED } from "@/data/algebra/routing";

export function useCurrency(
  address: Address | undefined,
  withNative?: boolean
): Currency | ExtendedNative | undefined {
  const isWNative =
    address?.toLowerCase() ===
    WNATIVE_EXTENDED[DEFAULT_CHAIN_ID].address.toLowerCase();

  const isNative = address === ADDRESS_ZERO;

  const token = useAlgebraToken(isNative || isWNative ? ADDRESS_ZERO : address);

  const extendedEther = ExtendedNative.onChain(
    DEFAULT_CHAIN_ID,
    DEFAULT_NATIVE_SYMBOL,
    DEFAULT_NATIVE_NAME
  );

  if (withNative) return isNative || isWNative ? extendedEther : token;

  if (isWNative) return extendedEther.wrapped;

  return isNative ? extendedEther : token;
}
