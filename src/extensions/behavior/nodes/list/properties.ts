import { Node, AbstractMesh, Light, Camera } from 'babylonjs';
import { LiteGraph } from 'litegraph.js';

import { GraphNode, registerNode } from '../graph-node';

/**
 * Registers all the available properties nodes.
 * @param object the object reference being customized using the graph editor.
 */
export function registerAllPropertiesNodes (object?: any): void {
    /**
     * Properties
     */

    registerNode({ name: 'Get Property', description: 'Gets the property of the current node and returns its value.', path: 'properties/getproperty', ctor: Object, functionRef: (node, target) => {
        const inputTarget = node.getInputData(1);
        if (node.isInputValid(inputTarget))
            target = inputTarget;
        
        const split = node.properties['Property Path'].split('.');
        const effectiveProperty = GraphNode.GetEffectiveProperty(target, node.properties['Property Path']);

        return effectiveProperty[split[split.length - 1]];
    }, properties: [
        { name: 'Property Path', type: 'string', defaultValue: 'name' },
        { name: 'Target Path', type: 'string', defaultValue: (object && object.name) ? object.name : 'Scene' }
    ], inputs: [
        { name: 'Execute', type: LiteGraph.EVENT },
        { name: 'Target', type: undefined }
    ], outputs: [
        { type: undefined, name: 'Value', propertyPath: 'propertyPath', propertyName: 'Property Path' }
    ], drawBackground: (node, target) => `${target}'s\n${node.properties['Property Path']}` }, object);

    registerNode({ name: 'Set Property', description: 'Sets the property of the current node to the input value.', path: 'properties/setproperty', ctor: Object, functionRef: (node, target) => {
        const inputTarget = node.getInputData(2);
        if (node.isInputValid(inputTarget))
            target = inputTarget;
        
        const split = node.properties['Property Path'].split('.');
        const effectiveProperty = GraphNode.GetEffectiveProperty(target, node.properties['Property Path']);
        const property = effectiveProperty[split[split.length - 1]];
        const input = node.getInputData(1);
        if (GraphNode.GetConstructorName(input) !== GraphNode.GetConstructorName(property) && input !== null)
            return node.getInputData(1);

        return (effectiveProperty[split[split.length - 1]] = input);
    }, inputs: [
        { name: 'Execute', type: LiteGraph.EVENT },
        { name: 'Value', type: undefined },
        { name: 'Target', type: undefined }
    ], properties: [
        { name: 'Property Path', type: 'string', defaultValue: 'name' },
        { name: 'Target Path', type: 'string', defaultValue: 'Self' }
    ], outputs: [
        { type: undefined, name: 'Value', propertyPath: 'propertyPath', propertyName: 'Property Path' }
    ], drawBackground: (node, target) => `${target}'s\n${node.properties['Property Path']}` }, object);

    /**
     * Variable
     */

    registerNode({ name: 'Variable', description: 'Sets a variable node taken from the avaialable node variables.', path: 'properties/variable', ctor: Object, functionRef: (node) => {
        node.graph.variables = node.graph.variables || [];
        const v = node.graph.variables.find(v => v.name === node.properties['Variable']);
        if (!v) {
            console.warn(`No variable found for name "${node.properties['Variable']}"`)
            return undefined;
        }

        const i = node.getInputData<any>(1);
        if (i !== null && i !== undefined)
            v.value = i;

        return v.value;
    }, inputs: [
        { name: 'Execute', type: LiteGraph.EVENT },
        { name: 'Set Value', type: undefined }
    ], outputs: [
        { name: 'Get Value', type: undefined }
    ], properties: [
        { name: 'Variable', type: 'string', defaultValue: '' }
    ], widgets: [
        { name: 'Variable', type: 'combo', value: 'None', callback: (v, g, n) => n.properties['Variable'] = v, options: {
            onInstanciate: (n, w) => w.value = n.properties['Variable'],
            values: (w, n) => n.graph.variables.map(v => v.name)
        } }
    ], drawBackground: (node) => node.properties['Variable'] }, object);

    /**
     * This
     */
    const name = object instanceof Node ? object.getClassName() : 'This';
    const type = object instanceof AbstractMesh ? 'mesh' :
                 object instanceof Light ? 'light' :
                 object instanceof Camera ? 'camera' :
                 null;

    registerNode({ name: 'This', description: '', path: 'properties/this', ctor: Object, functionRef: (node, target) => target, outputs: [
        { name: name, type: type }
    ] }, object);
}
