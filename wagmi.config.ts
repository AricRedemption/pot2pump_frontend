import { ContractConfig, defineConfig } from "@wagmi/cli";
import { actions, react } from "@wagmi/cli/plugins";
import {
  ALGEBRA_ETERNAL_FARMING,
  ALGEBRA_FACTORY,
  ALGEBRA_POSITION_MANAGER,
  ALGEBRA_QUOTER,
  ALGEBRA_QUOTER_V2,
  ALGEBRA_ROUTER,
  FARMING_CENTER,
} from "./data/algebra/addresses";
import {
  algebraFactoryABI,
  algebraPoolABI,
  algebraPositionManagerABI,
  algebraQuoterABI,
  algebraBasePluginABI,
  algebraRouterABI,
  algebraQuoterV2ABI,
  algebraEternalFarmingABI,
  farmingCenterABI,
  wNativeABI,
  algebraCustomPoolDeployerABI,
} from "./lib/abis/algebra-contracts/ABIs";

const contracts: ContractConfig[] = [
  {
    address: ALGEBRA_FACTORY,
    abi: algebraFactoryABI,
    name: "AlgebraFactory",
  },
  {
    abi: algebraPoolABI,
    name: "AlgebraPool",
  },
  {
    abi: algebraBasePluginABI,
    name: "AlgebraBasePlugin",
  },
  {
    address: ALGEBRA_POSITION_MANAGER,
    abi: algebraPositionManagerABI,
    name: "AlgebraPositionManager",
  },
  {
    address: ALGEBRA_QUOTER,
    abi: algebraQuoterABI,
    name: "AlgebraQuoter",
  },
  {
    address: ALGEBRA_QUOTER_V2,
    abi: algebraQuoterV2ABI,
    name: "AlgerbaQuoterV2",
  },
  {
    address: ALGEBRA_ROUTER,
    abi: algebraRouterABI,
    name: "AlgebraRouter",
  },
  {
    address: ALGEBRA_ETERNAL_FARMING,
    abi: algebraEternalFarmingABI,
    name: "AlgebraEternalFarming",
  },
  {
    address: FARMING_CENTER,
    abi: farmingCenterABI,
    name: "FarmingCenter",
  },
  {
    abi: algebraCustomPoolDeployerABI,
    name: "AlgebraCustomPoolDeployer",
  },
  {
    abi: wNativeABI,
    name: "WrappedNative",
  },
];

export default defineConfig({
  out: "wagmi-generated.ts",
  contracts,
  plugins: [actions({}), react({})],
});
