# pst-mongo

Extract objects from MS Outlook/Exchange PST files and stores in MongoDB

To run Mongo in a Docker container, use:

```bash
docker run --name mongodb -p 27017:27017 mongo
```

## Enron Dataset

For testing I run on the Enron email dataset and focus on the key players outlined in the articles below.

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

### Robert Bennett

Tthe attorney representing Enron in Washington, who also represented President Bill Clinton in the Paula Jones case.

### Joseph Berardino

CEO of Enron auditor Andersen, testified in December that his firm told Enron's audit committee that some of the company's actions might have been illegal.

<https://linkurio.us/blog/investigating-the-enron-email-dataset/>

### Tim Belden

### John Lavoreto

### Jeff Dasovich

### Kevin M. Presto

### Philip K. Ellen

### Louise Kitchen

### Kate Symes

<https://en.wikipedia.org/wiki/J._Clifford_Baxter>

An Enron Corporation executive who resigned in May 2001 before committing suicide the following year. Prior to his death he had agreed to testify before Congress in the Enron scandal.

<https://www.seattletimes.com/seattle-news/new-evidence-enron-was-scamming-years-before-energy-crunch/>  

### "Project Stanley"

<https://rodgersnotes.wordpress.com/2013/11/19/enron-email-analysis-persons-of-interest/>

<https://www.infosys.tuwien.ac.at/team/dschall/email/enron-employees.txt>

<https://pdfs.semanticscholar.org/4d7d/8fe43f391a966e0e15b68e6509fe6b533540.pdf>
