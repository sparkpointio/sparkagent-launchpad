"use client"

import { new_sparkpoint_logo_full_light } from '../lib/assets'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub, faXTwitter, faFacebook, faInstagram, faYoutube, faMedium, faTelegram, faLinkedin } from '@fortawesome/free-brands-svg-icons'

// TODO: Finish footer
export function Footer() {

  const footer_links = [
    {
      label: "Privacy Policy",
      url: "/privacy-policy",
      target: "_self",
      col: 1
    },
    {
      label: "SRK Token",
      url: "https://app.uniswap.org/explore/tokens/ethereum/0x0488401c3f535193fa8df029d9ffe615a06e74e6",
      target: "_blank",
      col: 1
    },
    {
      label: "CertiK Audit",
      url: "https://drive.google.com/file/d/1BizTH7JZgiYQaJbLyAGTnS83Do3yLvfT/view?usp=sharing",
      target: "_blank",
      col: 1
    },
    {
      label: "Home",
      url: "/#",
      target: "_self",
      col: 2
    },
    {
      label: "CoinMarketCap",
      url: "https://coinmarketcap.com/currencies/sparkpoint/",
      target: "_blank",
      col: 2
    },
    {
      label: "Contact",
      url: "mailto:support@sparkpoint.io",
      target: "_self",
      col: 2
    }
  ];

  const socials = [
    {
      icon: faGithub,
      href: "https://github.com/sparkpointio"
    },
    {
      icon: faXTwitter,
      href: "https://x.com/sparkpointio"
    },
    {
      icon: faFacebook,
      href: "https://facebook.com/sparkpointio"
    },
    {
      icon: faInstagram,
      href: "https://www.instagram.com/sparkpointio"
    },
    {
      icon: faYoutube,
      href: "https://www.youtube.com/@sparkpointio"
    },
    {
      icon: faMedium,
      href: "https://medium.com/theecosystem"
    },
    {
      icon: faTelegram,
      href: "https://t.me/SparkpointOfficial"
    },
    {
      icon: faLinkedin,
      href: "https://www.linkedin.com/company/sparkpointio"
    }
  ]
  return (
    <footer className="bg-[#20282A] text-white md:px-44 p-10 py-16 flex justify-between items-start gap-8 mx-auto lg:flex-row flex-col">
      <div className="grid gap-4">
        <Link className="flex items-center gap-2" href="/#">
          <Image
            src={new_sparkpoint_logo_full_light}
            alt="SparkPoint Logo"
            className="h-8 w-fit"
          />
        </Link>
        <div className="flex gap-4 items-center justify-start flex-wrap">
          {socials.map((social, index) => {
            return (
              <Link key={index} href={social.href} target='_blank'>
                <FontAwesomeIcon icon={social.icon} size='xl' color='#FF6F00' />
              </Link>
            )
          })}
        </div>
        <p className="text-sm">
          © {new Date().getFullYear()} SparkPoint Technologies Inc.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map(col => (
          <div key={col} className="flex flex-col gap-2">
            {footer_links.filter(link => link.col === col).map(link => (
              <Link href={link.url} key={link.label} className="text-sm hover:text-gray-400" target={link.target}>
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </footer>
  )
}