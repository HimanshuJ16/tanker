import { NextResponse } from 'next/server'

const API_KEY = process.env.DATA_GOV_IN_API_KEY

export async function GET() {
  if (!API_KEY) {
    console.error('API key is not set')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  try {
    const response = await fetch(
      `https://api.data.gov.in/resource/37231365-78ba-44d5-ac22-3deec40b9197?api-key=${API_KEY}&offset=0&limit=all&format=json`
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (!data.records || !Array.isArray(data.records)) {
      throw new Error('Unexpected data format from api.data.gov.in')
    }

    const districts = [...new Set(data.records.map((record: any) => record.district_name_english))]
      .filter(Boolean)
      .sort()

    return NextResponse.json(districts)
  } catch (error) {
    console.error('Error fetching districts:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
    }
    return NextResponse.json({ error: 'Failed to fetch districts' }, { status: 500 })
  }
}