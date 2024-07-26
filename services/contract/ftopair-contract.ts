import { BaseContract } from ".";
import { wallet } from "../wallet";
import { getContract } from "viem";
import { AsyncState, ContractWrite } from "../utils";
import { makeAutoObservable } from "mobx";
import { MUBAI_FTO_PAIR_ABI } from "@/lib/abis/ftoPair";
import BigNumber from "bignumber.js";
import { Token } from "./token";
import { dayjs } from "@/lib/dayjs";
import { cn } from "@/lib/tailwindcss";
import { trpcClient } from "@/lib/trpc";
import { ZodError } from "zod";

export class FtoPairContract implements BaseContract {
  address = "";
  name: string = "";
  abi = MUBAI_FTO_PAIR_ABI;
  raiseToken = new Token({});
  launchedToken = new Token({});
  depositedRaisedTokenWithoutDecimals: BigNumber | null = null;
  depositedLaunchedTokenWithoutDecimals: BigNumber | null = null;
  endTime: string = "";
  startTime: string = "";
  ftoState: number = -1;
  launchedTokenProvider: string = "";
  projectName = "";
  description = "";
  telegram = "";
  twitter = "";
  website = "";
  isValidated = false;
  isInit = false;
  provider = "";
  canClaimLP = false;
  socials: {
    name: string;
    link: string;
    icon: string;
  }[] = [];

  constructor(args: Partial<FtoPairContract>) {
    Object.assign(this, args);
    this.getIsValidated();
    makeAutoObservable(this);
  }

  get startTimeDisplay() {
    return this.startTime
      ? dayjs(
          new BigNumber(this.startTime).multipliedBy(1000).toNumber()
        ).toISOString()
      : "-";
  }

  get endTimeDisplay() {
    return this.endTime
      ? dayjs(
          new BigNumber(this.endTime).multipliedBy(1000).toNumber()
        ).toISOString()
      : "-";
  }

  get depositedRaisedToken() {
    return this.depositedRaisedTokenWithoutDecimals && this.raiseToken.decimals
      ? this.depositedRaisedTokenWithoutDecimals.div(
          new BigNumber(10).pow(this.raiseToken.decimals)
        )
      : undefined;
  }
  get depositedLaunchedToken() {
    return this.depositedLaunchedTokenWithoutDecimals &&
      this.launchedToken.decimals
      ? this.depositedLaunchedTokenWithoutDecimals.div(
          new BigNumber(10).pow(this.launchedToken.decimals)
        )
      : undefined;
  }

  get isProvider() {
    return (
      this.launchedTokenProvider.toLocaleLowerCase() ===
      wallet.account.toLocaleLowerCase()
    );
  }

  get contract() {
    return getContract({
      address: this.address as `0x${string}`,
      abi: this.abi,
      client: { public: wallet.publicClient, wallet: wallet.walletClient },
    });
  }

  get facadeContract() {
    return wallet.contracts.ftofacade;
  }

  get fotFactoryContract() {
    return wallet.contracts.ftofactory;
  }

  get price() {
    return this.depositedRaisedToken && this.depositedLaunchedToken
      ? this.depositedRaisedToken.div(this.depositedLaunchedToken)
      : undefined;
  }

  get isCompleted() {
    return (
      this.endTime && new BigNumber(this.endTime).isLessThan(dayjs().unix())
    );
  }

  get remainTime() {
    const now = dayjs();
    if (!this.endTime) {
      return "-";
    }
    //console.log("this.endTime", this.endTime);
    const targetTime = dayjs(
      new BigNumber(this.endTime).multipliedBy(1000).toNumber()
    );
    if (!targetTime.isValid()) {
      return "Invalid Date";
    }
    const diffDays = targetTime.diff(now, "days");

    if (Math.abs(diffDays) >= 1) {
      return `${Math.abs(diffDays)} ${
        diffDays > 0 ? "days later" : "days ago"
      }`;
    }

    const diffHours = targetTime.diff(now, "hours");

    if (Math.abs(diffHours) >= 1) {
      return `${Math.abs(diffHours)} ${
        diffHours > 0 ? "hours later" : "hours ago"
      }`;
    }

    const diffMinutes = targetTime.diff(now, "minutes");
    return `${Math.abs(diffMinutes)} ${
      diffMinutes > 0 ? "minutes later" : "minutes ago"
    }`;
  }

  deposit = new AsyncState(async ({ amount }: { amount: string }) => {
    amount = new BigNumber(amount)
      .multipliedBy(new BigNumber(10).pow(this.raiseToken.decimals))
      .toFixed();
    await this.raiseToken.approveIfNoAllowance({
      amount,
      spender: this.facadeContract.address,
    });
    console.log(
      this.raiseToken.address as `0x${string}`,
      this.launchedToken.address as `0x${string}`,
      BigInt(amount),
      BigInt(0)
    );
    await this.facadeContract.deposit.call([
      this.raiseToken.address as `0x${string}`,
      this.launchedToken.address as `0x${string}`,
      BigInt(amount),
      BigInt(0),
    ]);
    await Promise.all([
      this.getDepositedRaisedToken(),
      this.raiseToken.getBalance(),
    ]);
  });

  claimLP = new AsyncState(async () => {
    await this.facadeContract.claimLP.call([
      this.raiseToken.address as `0x${string}`,
      this.launchedToken.address as `0x${string}`,
    ]);
    this.canClaimLP = false;
  });

  resume = new AsyncState(async () => {
    await this.fotFactoryContract.resume.call([
      this.raiseToken.address as `0x${string}`,
      this.launchedToken.address as `0x${string}`,
    ]);
    await this.getFTOState();
  });

  pause = new AsyncState(async () => {
    await this.fotFactoryContract.pause.call([
      this.raiseToken.address as `0x${string}`,
      this.launchedToken.address as `0x${string}`,
    ]);
    await this.getFTOState();
  });

  get withdraw() {
    return new ContractWrite(this.contract.write.withdraw, {
      action: "Withdraw",
    });
  }

  get ftoStatusDisplay() {
    switch (this.ftoState) {
      case 0:
        return {
          status: "success",
          color: "bg-success/20 text-success-600",
        };
      case 1:
        return {
          status: "Fail",
          color: "bg-danger/20 text-danger",
        };
      case 2:
        return {
          status: "Paused",
          color: "bg-warning/20 text-warning-600",
        };
      case 3:
        if (this.isCompleted) {
          return {
            status: "Completed",
            color: "bg-[rgba(226,232,240,0.1)] text-default-foreground",
          };
        }
        return {
          status: "Processing",
          color: "text-[#83C2E9] bg-[rgba(131,194,233,0.1)]",
        };
    }
  }

  async getProjectInfo() {
    const res = await trpcClient.fto.getProjectInfo.query({
      chain_id: wallet.currentChainId,
      pair: this.address,
    });
    if (!res) {
      return;
    }
    this.socials = [];
    if (res.telegram) {
      this.telegram = res.telegram;
      this.socials.push({
        name: "telegram",
        link: res.telegram,
        icon: "/images/telegram.png",
      });
    }
    if (res.twitter) {
      this.twitter = res.twitter;
      this.socials.push({
        name: "twitter",
        link: res.twitter,
        icon: "/images/twitter.png",
      });
    }
    if (res.website) {
      this.website = res.website;
      this.socials.push({
        name: "website",
        link: res.website,
        icon: "/images/website.png",
      });
    }
    if (res.description) {
      this.description = res.description;
    }
    if (res.name) {
      this.projectName = res.name;
    }
    if (res.provider) {
      this.provider = res.provider;
    }
  }

  async init() {
    const cachedData = await fetch(
      `/api/server-cache/get-server-cache?key=fto:${this.address}:${wallet.currentChainId}`
    ).then((res) => res.json());

    //console.log("cachedData", cachedData);

    if (cachedData.status === "success") {
      const data = JSON.parse(cachedData.data);
      Object.assign(this, {
        ...data,
        depositedRaisedTokenWithoutDecimals:
          data.depositedRaisedTokenWithoutDecimals
            ? new BigNumber(data.depositedRaisedTokenWithoutDecimals)
            : null,
        depositedLaunchedTokenWithoutDecimals:
          data.depositedLaunchedTokenWithoutDecimals
            ? new BigNumber(data.depositedLaunchedTokenWithoutDecimals)
            : null,
      });

      await Promise.all([this.getRaisedToken(), this.getLaunchedToken()]);
      return;
    }

    await Promise.all([
      this.getRaisedToken(),
      this.getLaunchedToken(),
      this.getDepositedRaisedToken(),
      this.getDepositedLaunchedToken(),
      this.getStartTime(),
      this.getEndTime(),
      this.getFTOState(),
      this.getLaunchedTokenProvider(),
      this.getProjectInfo(),
      this.getCanClaimLP(),
    ]).catch((error) => {
      console.error(error, `init-${this.address}`);
      return;
    });

    const setData = await fetch(`/api/server-cache/set-server-cache`, {
      method: "POST",
      body: JSON.stringify({
        key: `fto:${this.address}:${wallet.currentChainId}`,
        data: JSON.stringify({
          ...this,
        }),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    //console.log("setData", setData);

    this.isInit = true;
  }

  getIsValidated() {
    this.isValidated = wallet.currentChain.validatedFtoAddresses.includes(
      this.address.toLowerCase()
    );
  }

  async getCanClaimLP() {
    try {
      const res = await this.contract.read.claimableLP([wallet.account] as [
        `0x${string}`
      ]);
      this.canClaimLP = res > 0;
    } catch (error) {
      this.canClaimLP = false;
      //console.error(error, `getCanClaimLP-${this.address}`);
    }
  }

  async getRaisedToken() {
    const res = (await this.contract.read.raisedToken()) as `0x${string}`;
    this.raiseToken = new Token({ address: res });
    this.raiseToken.init();
  }

  async getLaunchedToken() {
    const res = (await this.contract.read.launchedToken()) as `0x${string}`;
    this.launchedToken = new Token({ address: res });
    this.launchedToken.init();
  }

  async getDepositedRaisedToken() {
    const res = (await this.contract.read.depositedRaisedToken()) as bigint;
    this.depositedRaisedTokenWithoutDecimals = new BigNumber(res.toString());
  }

  async getDepositedLaunchedToken() {
    const res = (await this.contract.read.depositedLaunchedToken()) as bigint;
    this.depositedLaunchedTokenWithoutDecimals = new BigNumber(res.toString());
  }

  async getEndTime() {
    const res = await this.contract.read.endTime();
    this.endTime = res.toString();
  }

  async getStartTime() {
    const res = await this.contract.read.startTime();
    this.startTime = res.toString();
  }
  async getFTOState() {
    const res = await this.contract.read.FTOState();
    this.ftoState = res;
  }
  async getLaunchedTokenProvider() {
    const res = await this.contract.read.launchedTokenProvider();
    this.launchedTokenProvider = res;
  }
}
