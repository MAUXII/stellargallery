"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SleekLineCursorProps {
  friction?: number
  trails?: number
  size?: number
  dampening?: number
  tension?: number
  className?: string
}

interface NodeType {
  x: number
  y: number
  vx: number
  vy: number
}

interface WaveOptions {
  phase?: number
  offset?: number
  frequency?: number
  amplitude?: number
}

interface LineOptions {
  spring: number
}

class Wave {
  phase: number = 0
  offset: number = 0
  frequency: number = 0.001
  amplitude: number = 1
  private e: number = 0

  constructor(options: WaveOptions = {}) {
    this.init(options)
  }

  init(options: WaveOptions): void {
    this.phase = options.phase || 0
    this.offset = options.offset || 0
    this.frequency = options.frequency || 0.001
    this.amplitude = options.amplitude || 1
  }

  update(): number {
    this.phase += this.frequency
    this.e = this.offset + Math.sin(this.phase) * this.amplitude
    return this.e
  }

  value(): number {
    return this.e
  }
}

class Node implements NodeType {
  x: number = 0
  y: number = 0
  vx: number = 0
  vy: number = 0
}

class Line {
  spring: number = 0
  friction: number = 0
  nodes: NodeType[] = []

  constructor(options: LineOptions, config: { friction: number; size: number; dampening: number; tension: number }, pos: { x: number; y: number }) {
    this.init(options, config, pos)
  }

  init(options: LineOptions, config: { friction: number; size: number; dampening: number; tension: number }, pos: { x: number; y: number }): void {
    this.spring = options.spring + 0.1 * Math.random() - 0.02
    this.friction = config.friction + 0.01 * Math.random() - 0.002
    this.nodes = []

    for (let n = 0; n < config.size; n++) {
      const t = new Node()
      t.x = pos.x
      t.y = pos.y
      this.nodes.push(t)
    }
  }

  update(config: { dampening: number; tension: number }, pos: { x: number; y: number }): void {
    let e = this.spring
    let t = this.nodes[0]

    t.vx += (pos.x - t.x) * e
    t.vy += (pos.y - t.y) * e

    for (let i = 0, a = this.nodes.length; i < a; i++) {
      t = this.nodes[i]

      if (i > 0) {
        const n = this.nodes[i - 1]
        t.vx += (n.x - t.x) * e
        t.vy += (n.y - t.y) * e
        t.vx += n.vx * config.dampening
        t.vy += n.vy * config.dampening
      }

      t.vx *= this.friction
      t.vy *= this.friction
      t.x += t.vx
      t.y += t.vy
      e *= config.tension
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    let e: NodeType, t: NodeType
    let n = this.nodes[0].x
    let i = this.nodes[0].y

    ctx.beginPath()
    ctx.moveTo(n, i)

    for (let a = 1, o = this.nodes.length - 2; a < o; a++) {
      e = this.nodes[a]
      t = this.nodes[a + 1]
      n = 0.5 * (e.x + t.x)
      i = 0.5 * (e.y + t.y)
      ctx.quadraticCurveTo(e.x, e.y, n, i)
    }

    e = this.nodes[this.nodes.length - 2]
    t = this.nodes[this.nodes.length - 1]
    ctx.quadraticCurveTo(e.x, e.y, t.x, t.y)
    ctx.stroke()
    ctx.closePath()
  }
}

export function SleekLineCursor({
  friction = 0.5,
  trails = 20,
  size = 50,
  dampening = 0.25,
  tension = 0.98,
  className,
}: SleekLineCursorProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const ctxRef = React.useRef<CanvasRenderingContext2D & { running?: boolean; frame?: number } | null>(null)
  const waveRef = React.useRef<Wave | null>(null)
  const posRef = React.useRef({ x: 0, y: 0 })
  const linesRef = React.useRef<Line[]>([])
  const animationFrameRef = React.useRef<number | null>(null)

  const config = React.useMemo(() => ({
    friction,
    trails,
    size,
    dampening,
    tension,
  }), [friction, trails, size, dampening, tension])

  const createLines = React.useCallback(() => {
    linesRef.current = []
    for (let e = 0; e < config.trails; e++) {
      linesRef.current.push(new Line(
        { spring: 0.4 + (e / config.trails) * 0.025 },
        config,
        posRef.current
      ))
    }
  }, [config])

  const updatePosition = React.useCallback((e: MouseEvent | TouchEvent): void => {
    if ("touches" in e) {
      posRef.current.x = e.touches[0].pageX
      posRef.current.y = e.touches[0].pageY
    } else {
      posRef.current.x = e.clientX
      posRef.current.y = e.clientY
    }
    e.preventDefault()
  }, [])

  const handleTouchMove = React.useCallback((e: TouchEvent): void => {
    if (e.touches.length === 1) {
      posRef.current.x = e.touches[0].pageX
      posRef.current.y = e.touches[0].pageY
    }
  }, [])

  const render = React.useCallback(() => {
    const ctx = ctxRef.current
    const wave = waveRef.current
    if (!ctx || !wave) return

    if (ctx.running) {
      ctx.globalCompositeOperation = "source-over"
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      ctx.globalCompositeOperation = "lighter"
      ctx.strokeStyle = `hsla(${Math.round(wave.update())},50%,50%,0.2)`
      ctx.lineWidth = 1

      for (let t = 0; t < config.trails; t++) {
        const e = linesRef.current[t]
        if (e) {
          e.update(config, posRef.current)
          e.draw(ctx)
        }
      }

      ctx.frame = (ctx.frame || 0) + 1
      animationFrameRef.current = window.requestAnimationFrame(render)
    }
  }, [config])

  const resizeCanvas = React.useCallback(() => {
    const ctx = ctxRef.current
    if (ctx && ctx.canvas) {
      ctx.canvas.width = window.innerWidth - 20
      ctx.canvas.height = window.innerHeight
    }
  }, [])

  const onMouseMove = React.useCallback((e: MouseEvent | TouchEvent): void => {
    document.removeEventListener("mousemove", onMouseMove)
    document.removeEventListener("touchstart", onMouseMove)
    document.addEventListener("mousemove", updatePosition)
    document.addEventListener("touchmove", updatePosition)
    document.addEventListener("touchstart", handleTouchMove)
    updatePosition(e)
    createLines()
    render()
  }, [updatePosition, handleTouchMove, createLines, render])

  const handleFocus = React.useCallback(() => {
    const ctx = ctxRef.current
    if (ctx && !ctx.running) {
      ctx.running = true
      render()
    }
  }, [render])

  const handleBlur = React.useCallback(() => {
    const ctx = ctxRef.current
    if (ctx) {
      ctx.running = true
    }
  }, [])

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D & {
      running?: boolean
      frame?: number
    }

    ctxRef.current = ctx
    ctx.running = true
    ctx.frame = 1

    waveRef.current = new Wave({
      phase: Math.random() * 2 * Math.PI,
      amplitude: 85,
      frequency: 0.0015,
      offset: 285,
    })

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("touchstart", onMouseMove)
    document.body.addEventListener("orientationchange", resizeCanvas)
    window.addEventListener("resize", resizeCanvas)
    window.addEventListener("focus", handleFocus)
    window.addEventListener("blur", handleBlur)

    resizeCanvas()

    return () => {
      if (ctx) {
        ctx.running = false
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mousemove", updatePosition)
      document.removeEventListener("touchstart", onMouseMove)
      document.removeEventListener("touchstart", handleTouchMove)
      document.removeEventListener("touchmove", updatePosition)
      document.body.removeEventListener("orientationchange", resizeCanvas)
      window.removeEventListener("resize", resizeCanvas)
      window.removeEventListener("focus", handleFocus)
      window.removeEventListener("blur", handleBlur)
    }
  }, [onMouseMove, updatePosition, handleTouchMove, resizeCanvas, handleFocus, handleBlur])

  return (
    <canvas
      id="canvas"
      ref={canvasRef}
      className={cn("pointer-events-none fixed inset-0 z-[100]", className)}
    />
  )
}
