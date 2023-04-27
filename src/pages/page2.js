import React from "react"
import { Link } from "gatsby"

const pageStyles = {
  color: "#232129",
  padding: 96,
  fontFamily: "-apple-system, Roboto, sans-serif, serif",
}

const headingStyles = {
  marginTop: 0,
  marginBottom: 64,
  maxWidth: 320,
}

export default function Page2() {
  return (
    <main style={pageStyles}>
      <h1 style={headingStyles}>
        Page 2
      </h1> 
    <Link to="/">Home</Link>
    <br />
    <Link to="/page1">Page1</Link>
    </main>
  )
}