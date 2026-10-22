/**
 * Builds the SSAC Sports Analytics Media startup participation form in Google Forms,
 * plus a linked Google Sheet that collects every response.
 *
 * How to use:
 *   1. Go to https://script.google.com and click "New project".
 *   2. Delete the sample code, paste this whole file in, and click Save.
 *   3. Pick "createStartupForm" in the function dropdown and click Run.
 *   4. Approve the permissions prompt (it only creates a form and a sheet in your Drive).
 *   5. Open "Execution log" to get the links to the form, the editor and the sheet.
 */
function createStartupForm() {
  const form = FormApp.create('SSAC 2027 · Sports Analytics Media Startups');
  form
    .setDescription(
      'Where data meets the story.\n\n' +
      'Building the next wave of sports analytics media? Tell us about your company, ' +
      'your audience and your traction. Selected startups will be featured in the ' +
      'Sports Analytics Media section of the MIT Sloan Sports Analytics Conference.\n\n' +
      '~10 minutes · 5 sections'
    )
    .setProgressBar(true)
    .setCollectEmail(false)
    .setAllowResponseEdits(false)
    .setConfirmationMessage(
      "You're in the queue. Thanks for applying to the Sports Analytics Media section. " +
      'Our startup team will review your submission and reach out by email.'
    );

  const url = () => FormApp.createTextValidation()
    .setHelpText('Please enter a full link starting with https://')
    .requireTextIsUrl()
    .build();

  // 01 Company
  form.addSectionHeaderItem().setTitle('01 · Company').setHelpText('The basics about your startup.');
  form.addTextItem().setTitle('Company name').setRequired(true);
  form.addTextItem().setTitle('Website').setRequired(true).setValidation(url());
  form.addTextItem().setTitle('Year founded')
    .setValidation(FormApp.createTextValidation()
      .setHelpText('Enter a year, e.g. 2023')
      .requireNumberBetween(1990, 2030)
      .build());
  form.addTextItem().setTitle('Headquarters').setHelpText('City, Country');
  form.addListItem().setTitle('Team size')
    .setChoiceValues(['1–5', '6–15', '16–50', '51–200', '200+']);
  form.addTextItem().setTitle('Pitch deck link')
    .setHelpText('DocSend, Google Drive, etc. Make sure it is viewable by link.')
    .setValidation(url());

  // 02 Primary contact
  form.addPageBreakItem().setTitle('02 · Primary contact')
    .setHelpText('Who should we reach out to about participation?');
  form.addTextItem().setTitle('Full name').setRequired(true);
  form.addTextItem().setTitle('Title').setHelpText('e.g. Co-founder & CEO');
  form.addTextItem().setTitle('Email').setRequired(true)
    .setValidation(FormApp.createTextValidation()
      .setHelpText('Please enter a valid email address')
      .requireTextIsEmail()
      .build());
  form.addTextItem().setTitle('Phone');
  form.addTextItem().setTitle('LinkedIn').setValidation(url());

  // 03 Media focus
  form.addPageBreakItem().setTitle('03 · Media focus')
    .setHelpText('Section: Sports Analytics Media');
  form.addCheckboxItem().setTitle('What do you build?').setRequired(true)
    .setHelpText('Choose all that apply.')
    .setChoiceValues([
      'Data journalism / editorial',
      'Podcast / audio',
      'Video / streaming',
      'Broadcast graphics & visualization',
      'Newsletter / creator',
      'Fan engagement & social',
      'Betting & fantasy content',
      'AI-generated content',
      'Stats & data platform',
    ])
    .showOtherOption(true);
  form.addTextItem().setTitle('One-line pitch').setRequired(true)
    .setHelpText('140 characters max.')
    .setValidation(FormApp.createTextValidation()
      .setHelpText('Please keep it to 140 characters')
      .requireTextLengthLessThanOrEqualTo(140)
      .build());
  form.addParagraphTextItem().setTitle('What you do & why it matters').setRequired(true)
    .setHelpText('Product, customers, the analytics edge behind your media.');
  form.addTextItem().setTitle('Audience & reach')
    .setHelpText('Monthly users, subscribers, downloads, distribution partners, etc.');

  // 04 Funding
  form.addPageBreakItem().setTitle('04 · Funding')
    .setHelpText('Help us understand where you are on the journey.');
  form.addTextItem().setTitle('Total money raised (USD)').setRequired(true)
    .setHelpText('Numbers only, no $ or commas. e.g. 3500000 for $3.5M. Enter 0 if bootstrapped.')
    .setValidation(FormApp.createTextValidation()
      .setHelpText('Numbers only, e.g. 3500000')
      .requireNumberGreaterThanOrEqualTo(0)
      .build());
  form.addMultipleChoiceItem().setTitle('Current stage').setRequired(true)
    .setChoiceValues(['Bootstrapped', 'Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C+']);
  form.addTextItem().setTitle('Most recent round').setHelpText('Month and year, e.g. 03/2026');
  form.addListItem().setTitle('Revenue')
    .setChoiceValues(['Pre-revenue', 'Under $100K ARR', '$100K–$1M ARR', '$1M–$5M ARR', '$5M+ ARR']);
  form.addTextItem().setTitle('Notable investors')
    .setHelpText('Funds, angels, team or league partners');

  // 05 Conference
  form.addPageBreakItem().setTitle('05 · Conference');
  form.addMultipleChoiceItem().setTitle('Been to SSAC before?')
    .setChoiceValues([
      'No, first time',
      'Yes, as an attendee',
      'Yes, as a startup / exhibitor',
      'Yes, as a speaker',
    ]);
  form.addCheckboxItem().setTitle('How would you like to participate?')
    .setHelpText('Choose all that apply.')
    .setChoiceValues([
      'Showcase booth',
      'Pitch competition',
      'Live demo',
      'Panel / speaking',
      'Investor meetings',
      'Media partnership',
    ]);
  form.addParagraphTextItem().setTitle('Anything else?')
    .setHelpText('Demo needs, partnerships, questions.');
  form.addCheckboxItem().setTitle('Consent').setRequired(true)
    .setChoiceValues([
      'I confirm this information is accurate and agree to be contacted about the MIT Sloan ' +
      'Sports Analytics Conference. Funding details are used for selection only.',
    ]);

  // Responses go to a Google Sheet, which acts as the database.
  const sheet = SpreadsheetApp.create('SSAC Media Startups · Responses');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());

  Logger.log('Share this link with startups: ' + form.getPublishedUrl());
  Logger.log('Edit the form:                ' + form.getEditUrl());
  Logger.log('Responses spreadsheet:        ' + sheet.getUrl());
}
