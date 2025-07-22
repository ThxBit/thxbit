import React, { useState } from 'react'

const TradingUI = () => {
  const [loggedIn, setLoggedIn] = useState(false)
  const [price] = useState(0)
  const [tradeSettings, setTradeSettings] = useState({ amount: '', leverage: '' })
  const [trading, setTrading] = useState(false)

  const handleLogin = (e) => {
    e.preventDefault()
    setLoggedIn(true)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setTradeSettings((prev) => ({ ...prev, [name]: value }))
  }

  const toggleTrading = () => {
    setTrading((prev) => !prev)
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center p-4 text-white'>
      {!loggedIn ? (
        <form onSubmit={handleLogin} className='bg-white/20 backdrop-blur rounded-lg w-full max-w-xs p-8 space-y-4'>
          <h2 className='text-xl font-bold text-center'>로그인</h2>
          <input
            type='text'
            name='username'
            placeholder='Username'
            className='w-full px-3 py-2 rounded bg-white/30 focus:outline-none placeholder-white/70 text-white'
          />
          <input
            type='password'
            name='password'
            placeholder='Password'
            className='w-full px-3 py-2 rounded bg-white/30 focus:outline-none placeholder-white/70 text-white'
          />
          <button type='submit' className='w-full py-2 rounded bg-pink-500 hover:bg-pink-600'>
            시작하기
          </button>
        </form>
      ) : (
        <div className='bg-white/10 backdrop-blur rounded-lg p-8 w-full max-w-md space-y-6'>
          <div className='text-center'>
            <h2 className='text-2xl font-bold mb-2'>현재 코인 가격</h2>
            <p className='text-4xl'>{price} USD</p>
          </div>
          <div className='space-y-3'>
            <h3 className='text-xl font-semibold'>트레이딩 세팅</h3>
            <input
              type='number'
              name='amount'
              placeholder='Amount'
              value={tradeSettings.amount}
              onChange={handleChange}
              className='w-full px-3 py-2 rounded bg-white/30 focus:outline-none placeholder-white/70 text-white'
            />
            <input
              type='number'
              name='leverage'
              placeholder='Leverage'
              value={tradeSettings.leverage}
              onChange={handleChange}
              className='w-full px-3 py-2 rounded bg-white/30 focus:outline-none placeholder-white/70 text-white'
            />
          </div>
          <button onClick={toggleTrading} className='w-full py-2 rounded bg-emerald-500 hover:bg-emerald-600'>
            {trading ? '트레이딩 중지' : '트레이딩 시작'}
          </button>
        </div>
      )}
    </div>
  )
}

export default TradingUI
