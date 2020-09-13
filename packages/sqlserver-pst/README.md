# pst-sqlserver

Extract objects from MS Outlook/Exchange PST files and stores in SQL Server.

To run SQL Server in a Docker container, use:

```bash
docker run --name sqlserver -e 'ACCEPT_EULA=Y' -e 'SA_PASSWORD=f00bar' -p 1433:1433 -d mcr.microsoft.com/mssql/server:latest
```

## Enron Dataset

For testing I run on the Enron email dataset and focus on the key players outlined in the articles below.

## Key Players

<https://www.foxnews.com/story/fast-facts-key-enron-players>

### Kenneth L. Lay

CAREER: Former chairman and CEO. Founded Enron in 1985 when Houston Natural Gas merged with InterNorth in Omaha, Neb., and became chairman and CEO the next year.

Stepped down as CEO in February 2001 when Jeffrey Skilling took over; resumed the role when Skilling abruptly resigned on Aug. 14, 2001. Resigned as chairman and CEO Jan. 23, 2002; resigned from board Feb. 4, 2002.

Appeared before Congress in 2002 and invoked the Fifth Amendment. Alleged to have sold more than 4 million shares of stock for \$184 million from 1996-2001. Received bonuses of \$18.1 million in 1997-2000. Lives in a \$7.4 million penthouse near downtown Houston.

### Rosalee Fleming

Assistant to Kenneth L. Lay.

### Jeffrey K. Skilling

CAREER: Former CEO and director. Holds an MBA from Harvard and worked for McKinsey & Co. before joining Enron in 1990. Became president and chief operating officer in 1996, then succeeded Lay as CEO in February 2001. Resigned on Aug. 14, 2001, citing personal reasons.

Testified twice before Congress in February 2002. Claimed no knowledge of intimate details of Enron's financial dealings. Sold 1.3 million shares of stock for \$70.6 million and transferred 2 million shares back to Enron from June 1996 to November 2001. Received \$13.2 million in bonuses 1997-2000.

He remains a defendant in a lawsuit alleging he knowingly endorsed deceptive and misleading financial statements. An indictment was unsealed Feb. 19 charging him with 35 counts of fraud, conspiracy, filing false statements to auditors and insider trading. He has pleaded not guilty.

### Andrew S. Fastow

CAREER: Former chief financial officer who pleaded guilty Jan. 14, 2004, to conspiracy in a deal that called for a 10-year sentence and for him to help prosecutors in the investigation. Free on bond.

One of Skilling's first hires in 1990. Indicted Oct. 31, 2002, on 78 counts of wire and securities fraud, money laundering, conspiracy and obstruction for running various financial schemes designed to enrich him, his family and friends. Counts later increased to 98.

Earned at least \$45 million from LJM partnerships, investment vehicles named after his wife and two children. Pushed out of Enron on Oct. 24, 2001, the day after Lay expressed confidence in him to analysts.

Alleged to have sold more than 687,000 shares of Enron stock for \$33.7 million from June 1996 to November 2001. Pleaded guilty in January 2004 to two counts of conspiracy; agrees to cooperate with prosecutors and serve 10 years in prison when his help is no longer needed.

### Richard A. Causey

CAREER: Former chief accounting officer. Handled Enron audits for Arthur Andersen LLP before joining Enron. When the LJM investments were proposed to Enron's board of directors in 1999, he and chief risk officer Rick Buy were assigned to review all Enron transactions with LJM.

Fired Feb. 14, 2002, after release of an in-house report noting his failure to review the deals. Mentioned repeatedly by title in Fastow indictment as having a secret agreement with Fastow that LJMs would never lose money on deals with Enron. Told David Duncan, the top Enron auditor at Arthur Andersen, that Enron didn't like another Andersen auditor's objections to grouping investment vehicles known as Raptors to hide that two of the four that were bleeding cash.

Alleged to have sold about 209,000 Enron shares for \$13.3 million. Also received bonus payments of more than \$1.5 million from 1997-2000 when Enron was inflating profits and hiding debt based largely on the partnerships he was supposed to police. Indictment charging him with conspiracy and fraud unsealed Jan. 22, 2004. Expanded indictment unsealed Feb. 19 to include new charges against Skilling and increased charges against Causey; 35 counts for Skilling, 31 counts for Causey. Has pleaded not guilty.

### Michael Kopper

Former Fastow lieutenant who pleaded guilty Aug. 21, 2002 to federal conspiracy and money laundering charges related to Enron's fall and agreed to give up \$12 million in illegal profits. Kopper admitted he ran or helped create several partnerships that earned him and others millions of dollars, including kickbacks he funneled to Fastow, while hiding debt and inflating profits at Enron. Has not yet been sentenced and is cooperating with prosecutors. Declined to testify before Congress.

### Lea Fastow

Wife of Andrew Fastow and former assistant treasurer at Enron. Pleaded guilty May 6, 2004, to a federal misdemeanor tax crime for helping her husband hide ill-gotten income from the government. She originally pleaded guilty to a felony tax crime in January, but withdrew that plea in April. She was sentenced to the maximum of a year in prison and ordered to surrender there July 12.

### Blen Glisan Jr

Added to an expanded Fastow indictment unsealed in May 2003. Glisan became Enron treasurer in March 2000, and earned $1 million in May of that year on a March investment of \$5,826 in Fastow's Southampton Place partnership. Also negotiated for Enron in some of its transactions with Raptor. Worked with Fastow and Kopper in creating and running LJM2. Fired from Enron in November 2001. Indicted in April 2003 on charges of wire fraud, money laundering and conspiracy to commit wire fraud, falsify books and commit securities and wire fraud. He tried to cut a deal with prosecutors, but ended up pleading guilty to one count of conspiracy in September 2003. He was immediately sentenced to prison for five years and became the first former Enron executive to serve time. He later began cooperating with prosecutors.

### Dan Boyle

Also added to an expanded Fastow indictment. Charged with conspiracy to falsify books and commit wire fraud related to Enron's deal to have Merrill Lynch buy three electricity-generating power barges. Boyle's lawyer says he had no authority to sign off on anything. Fastow promised Merrill that Enron would buy back the barges in 2000, which it did, booking a \$12 million profit that was really a loan.

<https:/>/www.theguardian.com/business/2002/jan/13/corporatefraud.enron>

### Mark Frevert

Enron vice chairman

### Lawrence 'Greg' Whalley

Enron president and chief operating officer.

### Jeffrey McMahon

Enron chief financial officer.

<https://linkurio.us/blog/investigating-the-enron-email-dataset/>

### Tim Belden

<https://linkurio.us/blog/investigating-the-enron-email-dataset/>

<https://www.wired.com/2006/01/science-puts-enron-e-mail-to-use/>

<https://caraellison.wordpress.com/tag/tim-belden/>

The names for Enron’s west coast energy trading strategies were given a lot of attention in the media and in smear campaigns like The Smartest Guys In The Room, as if the mere names were incantations of evil: Fatboy, Death Star, Wheel Out, Get Shorty, Ricochet.

Though the names were exciting – and they did represent some novel trading ideas – the strategies themselves were legal. Timothy Belden, the former head of trading in Enron’s Portland, Oregon office and generally credited as the architect of these strategies, was – and is – an incredibly smart person. To me, personally, he always seemed like one of those incredibly intelligent hacker kids who broke into the Pentagon’s computer networks not to steal anything but because they wanted to know how to break into the Pentagon’s servers. The world in some ways just wasn’t complex enough for him. A few days ago I wrote a satiric post about the California energy crisis and used the metaphor of chess, which I still believe to be a perfect metaphor.  Tim Belden wanted to make money. He didn’t do it by outright stealing or anything as crass as that. Instead, like a master chess champion, he studied. He learned the game. And he found vulnerabilities. They were not vulnerabilities that he created. He just took advantage of them, sort of like seeing a plane ticket to Australia onsale for \$2 and then holding the airline responsible for the mistake.

Ricochet was a name for a strategy used by Enron traders to – as the kids say – “game” the California energy market (it was also called “megawatt laundering”). This strategy was designed to skirt California’s price caps. Traders would buy electricity in California, sell it to an out-of-state buyer, then buy it back at a slightly higher price and resell it to California at an even higher price.

If you never knew anything else about Enron or energy companies in general, this might sound like a sneaky thing to do – but it’s no more sneaky than short selling or arbitraging.

Enron served the entire West Coast, up into Canada. It’s true that power flowed in and out of California, but its true for anywhere. If the power was needed in Oregon, and it was since there had been so little rain that summer to power the dams that created electricity, then it was sent to Oregon, or Washington or Vancouver. Then it was needed back in California and was brought back into California.

The situation in California was worsened by the fact that even in its ‘deregulated’ state, it was still a tightly controlled business environment. Producers were told by the state of California that they had to sell their electricity at a certain rate. Enron was not a producer. They were a marketer. (This puts them one step away from any scandal, by the way.) If producers realized that they could get a better price for their product in, say, Oregon, or Washington, then they would push and/or displace the energy from California and put it elsewhere. California has mild winters but winter in Seattle and Portland and even in Reno can be brutal – so you can understand why the producers would push their electricity to those places. In summer, California needs the energy more (i.e., Portland has very mild winters.) The fact that Enron transferred energy around is NOT indicative of illegality, impropriety, or even bad business judgment. It was exactly what they were being paid to do.

### John Lavoreto

### Jeff Dasovich

### Kevin M. Presto

### Philip K. Ellen

### Louise Kitchen

### Kate Symes

<https://en.wikipedia.org/wiki/J._Clifford_Baxter>

An Enron Corporation executive who resigned in May 2001 before committing suicide the following year. Prior to his death he had agreed to testify before Congress in the Enron scandal.

<https://www.seattletimes.com/seattle-news/new-evidence-enron-was-scamming-years-before-energy-crunch/>  

### Sherron Watkins

<https://en.wikipedia.org/wiki/Sherron_Watkins>

Sherron Watkins (born August 28, 1959) is an American former Vice President of Corporate Development at the Enron Corporation. Watkins was called to testify before committees of the U.S. House of Representatives and Senate at the beginning of 2002, primarily about her warnings to Enron's then-CEO Kenneth Lay about accounting irregularities in the financial statements.

In August 2001, Watkins alerted then-Enron CEO Kenneth Lay of accounting irregularities in financial reports. However, Watkins has been criticized for not reporting the fraud to government authorities and not speaking up publicly sooner about her concerns, as her memo did not reach the public until five months after it was written. Ms. Watkins was represented by Houston attorney Philip H. Hilder.

Watkins was selected as one of three "Persons of the Year 2002" by Time.

## Special Purpose Entities

<https://en.wikipedia.org/wiki/Chewco>

### JEDI and Chewco

In 1993, Enron established a joint venture in energy investments with CalPERS, the California state pension fund, called the Joint Energy Development Investments (JEDI). In 1997, Skilling, serving as Chief Operating Officer (COO), asked CalPERS to join Enron in a separate investment. CalPERS was interested in the idea, but only if it could be terminated as a partner in JEDI. However, Enron did not want to show any debt from assuming CalPERS' stake in JEDI on its balance sheet. Chief Financial Officer (CFO) Fastow developed the special purpose entity Chewco Investments limited partnership (L.P.) which raised debt guaranteed by Enron and was used to acquire CalPERS's joint venture stake for $383 million. Because of Fastow's organization of Chewco, JEDI's losses were kept off of Enron's balance sheet.

In autumn 2001, CalPERS and Enron's arrangement was discovered, which required the discontinuation of Enron's prior accounting method for Chewco and JEDI. This disqualification revealed that Enron's reported earnings from 1997 to mid-2001 would need to be reduced by $405 million and that the company's indebtedness would increase by $628 million.

### Whitewing

Whitewing was the name of a special purpose entity used as a financing method by Enron. In December 1997, with funding of $579 million provided by Enron and $500 million by an outside investor, Whitewing Associates L.P. was formed. Two years later, the entity's arrangement was changed so that it would no longer be consolidated with Enron and be counted on the company's balance sheet. Whitewing was used to purchase Enron assets, including stakes in power plants, pipelines, stocks, and other investments. Between 1999 and 2001, Whitewing bought assets from Enron worth $2 billion, using Enron stock as collateral. Although the transactions were approved by the Enron board, the asset transfers were not true sales and should have been treated instead as loans.

### LJM and Raptors

n 1999, Fastow formulated two limited partnerships: LJM Cayman. L.P. (LJM1) and LJM2 Co-Investment L.P. (LJM2), for the purpose of buying Enron's poorly performing stocks and stakes to improve its financial statements. LJM 1 and 2 were created solely to serve as the outside equity investor needed for the special purpose entities that were being used by Enron. Fastow had to go before the board of directors to receive an exemption from Enron's code of ethics (as he had the title of CFO) in order to manage the companies., 197 The two partnerships were funded with around $390 million provided by Wachovia, J.P. Morgan Chase, Credit Suisse First Boston, Citigroup, and other investors. Merrill Lynch, which marketed the equity, also contributed \$22 million to fund the entities.

Enron transferred to "Raptor I-IV", four LJM-related special purpose entities named after the velociraptors in Jurassic Park, more than "\$1.2 billion in assets, including millions of shares of Enron common stock and long term rights to purchase millions more shares, plus \$150 million of Enron notes payable" as disclosed in the company's financial statement footnotes. The special purpose entities had been used to pay for all of this using the entities' debt instruments. The footnotes also declared that the instruments' face amount totaled \$1.5 billion, and the entities notional amount of \$2.1 billion had been used to enter into derivative contracts with Enron.

Enron capitalized the Raptors, and, in a manner similar to the accounting employed when a company issues stock at a public offering, then booked the notes payable issued as assets on its balance sheet while increasing the shareholders' equity for the same amount. This treatment later became an issue for Enron and its auditor Arthur Andersen as removing it from the balance sheet resulted in a \$1.2 billion decrease in net shareholders' equity.

Eventually the derivative contracts worth \$2.1 billion lost significant value. Swaps were established at the time the stock price achieved its maximum. During the ensuing year, the value of the portfolio under the swaps fell by \$1.1 billion as the stock prices decreased (the loss of value meant that the special purpose entities technically now owed Enron \$1.1 billion by the contracts). Enron, which used a "mark-to-market" accounting method, claimed a \$500 million gain on the swap contracts in its 2000 annual report. The gain was responsible for offsetting its stock portfolio losses and was attributed to nearly a third of Enron's earnings for 2000 (before it was properly restated in 2001).

### "Project Stanley"

<https://rodgersnotes.wordpress.com/2013/11/19/enron-email-analysis-persons-of-interest/>

<https://www.infosys.tuwien.ac.at/team/dschall/email/enron-employees.txt>

<https://pdfs.semanticscholar.org/4d7d/8fe43f391a966e0e15b68e6509fe6b533540.pdf>
