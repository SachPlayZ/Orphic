import { useWriteContract, useReadContract } from "wagmi";
import abi from "@/abi";

const contractAddress = "0x614A1F64395FD1b925E347AC13812CC48b62f5B7"


function getFaction(address: `0x${string}`) {
    const {data, isLoading} = useReadContract({
        address:contractAddress,
        abi:abi,
        functionName:"getPlayerFaction",
        args:[address]
    })
    if (data == 1)
    {
        return "Dragons"
    }
    else if (data == 2)
    {
        return "Tigers"
    }
}



export {getFaction}