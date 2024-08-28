const puppeteer = require('puppeteer');
const axios = require('axios');
async function fetchDataAndFillForm() {
  const response = await axios.get('http://localhost:3333/serviceOrder/findById/e128de36-5b42-4cff-9358-97898c011b9f');
  const data = response.data;  
  console.log(data.serviceOrder.numberOs)
  const browser = await puppeteer.launch({ headless: false});
  const page = await browser.newPage();
  await page.goto('https://login.contaazul.com/');
  await page.setViewport({ width: 1920, height: 1080 });
  const email = await page.waitForSelector('::-p-xpath(/html/body/div[4]/div/div[1]/div/div/div[2]/div/div/div[3]/div/div/form/div/div/div[1]/div/div/div/input)');
  await email.type('email');
  const password = await page.waitForSelector('::-p-xpath(/html/body/div[4]/div/div[1]/div/div/div[2]/div/div/div[3]/div/div/form/div/div/div[2]/div/div/div[1]/input)');
  await password.type('senha');
  const button = await page.waitForSelector('::-p-xpath(/html/body/div[4]/div/div[1]/div/div/div[2]/div/div/div[3]/div/div/form/div/div/div[4]/div/div/span/button)');
  await button.click();
  await page.waitForSelector('.ds-row.ds-u-margin-y--none.ds-u-margin-right--none.ds-row--content-vertical-align-center.ds-u-flex-wrap--nowrap');
  await Promise.all([
    page.waitForNavigation(),
    page.goto('https://app.contaazul.com/#/ordens-de-servico/nova'),
  ]);

  // Agora procura pelo elemento
  const inputElement = await page.waitForSelector('#workOrderNumber');
  await inputElement.click({ clickCount: 3 });
  await inputElement.press('Backspace');
  await inputElement.type(data.serviceOrder.numberOs);
  const startDate = await page.waitForSelector('#workOrderStartDate');
  await startDate.click({ clickCount: 3 });
  await startDate.press('Backspace');
  await startDate.type('27082024');
  const endDate = await page.waitForSelector('#workOrderEndDate');
  await endDate.click({ clickCount: 3 });
  await endDate.press('Backspace');
  await endDate.type('30082024');
  const buttonCliente = await page.waitForSelector('::-p-xpath(//*[@id="workOrder"]/form/div/ng-transclude/div/div[3]/div[1]/ca-field/div/ng-transclude/caf-customer-search-select/div/ca-search-select/div/ca-select/div/button)');
  await buttonCliente.click();
  const inputCliente = await page.waitForSelector('::-p-xpath(//*[@id="workOrder"]/form/div/ng-transclude/div/div[3]/div[1]/ca-field/div/ng-transclude/caf-customer-search-select/div/ca-search-select/div/ca-select/div/div/div/ca-search-select-input/span/ca-input/div/span/input)');
  await inputCliente.click()
  await inputCliente.type(data.serviceOrder.costumer.name);
  await page.waitForFunction(
    text => document.querySelector('body').innerText.includes(text),
    {},
    data.serviceOrder.costumer.name
  );

  // // Localizando elementos pelo texto
  // await page.waitForSelector('span.ca-u-block.ca-u-color-blue-dark.ng-binding.ng-scope', { visible: true });

  const selector = 'span.ca-u-block.ca-u-color-blue-dark.ng-binding.ng-scope';
  const elements = await page.$$(selector);
  console.log(elements.length);  // Mostra quantos elementos foram encontrados
  let found = false;  // Variável para controlar se o elemento já foi encontrado e clicado

  for (const element of elements) {
    const text = await page.evaluate(el => el.textContent, element);
    if (text.trim() === data.serviceOrder.costumer.name && !found) {
      await element.click();  // Clique no primeiro elemento correspondente
      found = true;  // Marque que o elemento foi encontrado e clicado
      break;  // Saia do loop após o clique no primeiro elemento correspondente
    }
  }

  if (!found) {
    console.log("Nenhum elemento correspondente encontrado para clicar.");
  }


  await page.type('#workOrderResponsible', data.serviceOrder.costumer.owner)
  await page.type('#workOrderReceivedEquipment', `${data.serviceOrder.equipTypeName} ${data.serviceOrder.equipTypeEnergyName} ${data.serviceOrder.equipPower} ${data.serviceOrder.equipVoltage} ${data.serviceOrder.rpm} RPM`)
  await page.type("#workOrderMark", data.serviceOrder.equipBrand)
  await page.type("#workOrderModel", data.serviceOrder.equipMod)
  await page.type("#workOrderReceivedObservation", `VALOR TOTAL: ${data.serviceOrder.totalValue.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`)
  await page.type("#workOrderReceivedObservation", `\nPRAZO PAGAMENTO: ${data.serviceOrder.costumerDDL}`)
  await page.type("#workOrderProblemDescription", `${data.serviceOrder.descriptionPresentedDefect}`)
  await page.type("#workOrderServiceDescription", `
    ${data.serviceOrder.descriptionService.map((service) => `\n${service}`)}${data.serviceOrder.materials.map((materials) => materials.providedByCostumer === false ? `\n ${materials.quantity} - ${materials.materialType} ${materials.name}` : `\n ${materials.quantity} - ${materials.materialType}(S) ${materials.name} ( FORNECIDO PELO CLIENTE ) `) }
    `)

  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  // await browser.close()

}


fetchDataAndFillForm();
