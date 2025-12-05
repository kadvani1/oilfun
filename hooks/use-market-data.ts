"use client"

import { useReadContract, useReadContracts } from "wagmi"
import { alloMarketsConfig, formatUSDC } from "@/lib/contracts"

interface AmountAdded {
  user: string
  amount: bigint
  timestamp: bigint
}

export interface FormattedMarket {
  id: number
  questionId: number
  question: string
  description: string
  createdBy: string
  totalVolume: number
  totalYesAmount: number
  totalNoAmount: number
  yesPercentage: number
  noPercentage: number
  endTimestamp: Date
  eventCompleted: boolean
  isLive: boolean
  yesBets: { user: string; amount: number; timestamp: Date }[]
  noBets: { user: string; amount: number; timestamp: Date }[]
}

// Hook to fetch a single market by question ID with graph data
export function useMarketData(questionId: number) {
  // Fetch question data
  const { 
    data: questionData, 
    isLoading: isLoadingQuestion, 
    error: questionError,
    refetch: refetchQuestion 
  } = useReadContract({
    ...alloMarketsConfig,
    functionName: "questions",
    args: [BigInt(questionId)],
  })

  // Fetch graph data for bet history
  const { 
    data: graphData, 
    isLoading: isLoadingGraph, 
    error: graphError,
    refetch: refetchGraph 
  } = useReadContract({
    ...alloMarketsConfig,
    functionName: "getGraphData",
    args: [BigInt(questionId)],
  })

  const isLoading = isLoadingQuestion || isLoadingGraph
  const error = questionError || graphError

  const refetch = () => {
    refetchQuestion()
    refetchGraph()
  }

  let formattedMarket: FormattedMarket | null = null

  if (questionData && Array.isArray(questionData)) {
    try {
      // Contract returns a tuple as an array:
      const [
        id,
        question,
        timestamp,
        endTimestamp,
        createdBy,
        creatorImageHash,
        totalAmount,
        totalYesAmount,
        totalNoAmount,
        eventCompleted,
        description,
        resolverUrl,
      ] = questionData as [
        bigint,
        string,
        bigint,
        bigint,
        string,
        string,
        bigint,
        bigint,
        bigint,
        boolean,
        string,
        string
      ]

      // Only process if we have a valid question
      if (question && question.length > 0) {
        // Parse graph data if available
        let yesBets: { user: string; amount: number; timestamp: Date }[] = []
        let noBets: { user: string; amount: number; timestamp: Date }[] = []
        let calculatedYesAmount = 0
        let calculatedNoAmount = 0

        if (graphData && Array.isArray(graphData) && graphData.length === 2) {
          const [yesData, noData] = graphData as [AmountAdded[], AmountAdded[]]

          // Process yes bets
          if (yesData && Array.isArray(yesData)) {
            yesBets = yesData.map((bet) => ({
              user: bet.user,
              amount: formatUSDC(bet.amount),
              timestamp: new Date(Number(bet.timestamp) * 1000),
            }))
            calculatedYesAmount = yesData.reduce(
              (sum, bet) => sum + formatUSDC(bet.amount), 
              0
            )
          }

          // Process no bets
          if (noData && Array.isArray(noData)) {
            noBets = noData.map((bet) => ({
              user: bet.user,
              amount: formatUSDC(bet.amount),
              timestamp: new Date(Number(bet.timestamp) * 1000),
            }))
            calculatedNoAmount = noData.reduce(
              (sum, bet) => sum + formatUSDC(bet.amount), 
              0
            )
          }
        }

        // Use graph data for calculations if available, otherwise fall back to contract totals
        const totalYes = calculatedYesAmount > 0 ? calculatedYesAmount : formatUSDC(totalYesAmount)
        const totalNo = calculatedNoAmount > 0 ? calculatedNoAmount : formatUSDC(totalNoAmount)
        const total = totalYes + totalNo

        // Calculate percentages from graph data (default to 50/50 if no bets)
        const yesPercentage = total > 0 ? (totalYes / total) * 100 : 50
        const noPercentage = total > 0 ? (totalNo / total) * 100 : 50

        formattedMarket = {
          id: questionId,
          questionId: Number(id),
          question,
          description: description || "",
          createdBy,
          totalVolume: total > 0 ? total : formatUSDC(totalAmount),
          totalYesAmount: totalYes,
          totalNoAmount: totalNo,
          yesPercentage,
          noPercentage,
          endTimestamp: new Date(Number(endTimestamp) * 1000),
          eventCompleted,
          isLive: true,
          yesBets,
          noBets,
        }
      }
    } catch (e) {
      console.error("Error parsing market data:", e)
    }
  }

  return {
    market: formattedMarket,
    rawData: questionData,
    graphData,
    isLoading,
    error,
    refetch,
  }
}

// Hook to fetch total number of questions
export function useTotalQuestions() {
  const { data, isLoading, error } = useReadContract({
    ...alloMarketsConfig,
    functionName: "totalQuestions",
  })

  return {
    totalQuestions: data ? Number(data) : 0,
    isLoading,
    error,
  }
}
