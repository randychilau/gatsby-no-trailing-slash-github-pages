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

export default function Page1() {
  return (
    <main style={pageStyles}>
      <h1 style={headingStyles}>
        Page 1
      </h1> 
    <Link to="/">Home</Link>
    <br /><br />
    <Link to="/page2">Page2</Link>
    </main>
  )
}